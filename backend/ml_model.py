from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pandas as pd
import numpy as np
import logging
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_absolute_percentage_error

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("stock_model")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoricalDataPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class ForecastRequest(BaseModel):
    historical_data: List[HistoricalDataPoint]
    forecast_days: Optional[int] = 5 

class ForecastResponse(BaseModel):
    historical_dates: List[str]
    historical_prices: List[float]
    forecast_dates: List[str]
    forecast_prices: List[float]
    confidence_intervals: List[dict]
    metrics: dict

def infer_data_frequency(dates: pd.Series) -> str:
    """Infer the frequency of the datetime index."""
    inferred_freq = pd.infer_freq(dates)
    return inferred_freq if inferred_freq else 'D'

@app.post("/forecast/", response_model=ForecastResponse)
async def predict_stock(request: ForecastRequest):
    try:
        logger.info("Received stock prediction request")


        data = pd.DataFrame([
            {
                'ds': pd.to_datetime(point.date).tz_localize(None),
                'y': point.close,
            }
            for point in request.historical_data
        ])

        data = data.drop_duplicates(subset='ds').sort_values('ds').reset_index(drop=True)

        if len(data) < 30:
            raise HTTPException(status_code=400, detail="Need at least 30 data points")

        data_freq = infer_data_frequency(data['ds'])
        logger.info(f"Inferred data frequency: {data_freq}")

        forecast_length = min(request.forecast_days or 5, 5) 

        model = Prophet(changepoint_prior_scale=0.5)

        if data_freq in ['T', '5T', '15T', 'H']:
            model.add_seasonality(name='daily', period=1, fourier_order=15)
            model.add_seasonality(name='weekly', period=7, fourier_order=5)
        else:
            model.add_seasonality(name='monthly', period=30.5, fourier_order=5) 

        model.fit(data)

        future_dates = model.make_future_dataframe(periods=forecast_length, freq=data_freq)
        
        forecast = model.predict(future_dates)

        future_forecast = forecast[forecast['ds'] > data['ds'].max()]
        train_data = data.iloc[:int(len(data) * 0.8)]
        train_forecast = model.predict(train_data[['ds']])
        
        mae = mean_absolute_error(train_data['y'], train_forecast['yhat'])
        mape = mean_absolute_percentage_error(train_data['y'], train_forecast['yhat']) * 100

        metrics_dict = {
            'mae': float(mae),
            'mape': float(mape),
            'validation_period': f"{train_data['ds'].iloc[0].strftime('%Y-%m-%d %H:%M:%S')} to {train_data['ds'].iloc[-1].strftime('%Y-%m-%d %H:%M:%S')}"
        }

        # Prepare response data
        historical_dates = data['ds'].dt.strftime("%Y-%m-%dT%H:%M:%S").tolist()
        historical_prices = data['y'].tolist()

        forecast_dates = future_forecast['ds'].dt.strftime("%Y-%m-%dT%H:%M:%S").tolist()
        forecast_prices = future_forecast['yhat'].tolist()
        
        confidence_intervals = [
            {
                'lower': float(row['yhat_lower']),
                'upper': float(row['yhat_upper'])
            }
            for _, row in future_forecast.iterrows()
        ]

        return ForecastResponse(
            historical_dates=historical_dates,
            historical_prices=historical_prices,
            forecast_dates=forecast_dates,
            forecast_prices=forecast_prices,
            confidence_intervals=confidence_intervals,
            metrics=metrics_dict
        )

    except Exception as e:
        logger.error(f"Error in predict_stock: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)