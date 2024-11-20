"use client";

import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { format, parseISO } from 'date-fns';
import { Spinner } from '../ui/spinner';
import { AiOutlineStock } from "react-icons/ai";
import { Skeleton } from '../ui/skeleton';

type TimeWindow = '1D' | '5D' | '1M' | '6M' | 'YTD' | '1Y' | '5Y' | 'MAX';

interface PolygonDataPoint {
  c: number;
  h: number;
  l: number;
  n: number;
  o: number;
  t: number;
  v: number;
  vw: number;
}

interface PolygonResponse {
  adjusted: boolean;
  next_url: string;
  queryCount: number;
  request_id: string;
  results: PolygonDataPoint[];
  resultsCount: number;
  status: string;
  ticker: string;
  error?: string;
}

interface StockDataPoint {
  date: string;
  price: number;
  isForecast?: boolean;
  confidenceLower?: number;
  confidenceUpper?: number;
}

interface StockChartProps {
  ticker: string;
  stockName: string;
}

interface ForecastResponse {
  historical_dates: string[];
  historical_prices: number[];
  forecast_dates: string[];
  forecast_prices: number[];
  confidence_intervals: { lower: number; upper: number }[];
  metrics: {
    mae: number;
    mape: number;
    validation_period: string;
  };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const point = payload[0].payload;
    const isForecast = point.isForecast;
    return (
      <div className="text-white bg-black p-2">
        <p className="text-sm">{format(parseISO(label), 'MMM d, yyyy h:mm a')}</p>
        <p className="text-md">
          ${point.price.toFixed(2)} {isForecast && <span className="text-xs">(Forecasted)</span>}
        </p>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<StockChartProps> = ({ ticker, stockName }) => {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('1D');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [priceChange, setPriceChange] = useState<{
    value: number;
    percentage: number;
  } | null>(null);

  const getChartColors = () => {
    const isPositive = priceChange && priceChange.value >= 0;
    return {
      primary: isPositive ? '#D4FF00' : '#eb5757',
    };
  };

  const transformData = (data: PolygonResponse): StockDataPoint[] => {
    return data.results.map((point) => {
      const timestamp = point.t < 1e12 ? point.t * 1000 : point.t;
      const date = new Date(timestamp);
      return {
        date: date.toISOString(),
        price: point.c,
      };
    });
  };

  const getForecast = async () => {
    setIsForecasting(true);
    try {
      const historicalData = data.map(point => ({
        date: point.date,
        open: point.price,
        high: point.price,
        low: point.price,
        close: point.price,
        volume: 0,
      }));

      const response = await fetch('http://localhost:8000/forecast/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ historical_data: historicalData, forecast_days: 5 }),
      });

      if (!response.ok) throw new Error('Failed to fetch forecast');

      const forecastData: ForecastResponse = await response.json();
      const forecastedData = forecastData.forecast_dates.map((date, index) => ({
        date,
        price: forecastData.forecast_prices[index],
        isForecast: true,
        confidenceLower: forecastData.confidence_intervals[index].lower,
        confidenceUpper: forecastData.confidence_intervals[index].upper,
      }));

      const combinedData = [...data, ...forecastedData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setData(combinedData);
      setShowForecast(true);
    } catch (error) {
      setError('Failed to generate forecast');
    } finally {
      setIsForecasting(false);
    }
  };

  const getDateRange = (window: TimeWindow): { from: string; to: string } => {
    const toDate = new Date();
    const fromDate = new Date(toDate);
    switch (window) {
      case '1D': fromDate.setDate(toDate.getDate() - 1); break;
      case '5D': fromDate.setDate(toDate.getDate() - 5); break;
      case '1M': fromDate.setMonth(toDate.getMonth() - 1); break;
      case '6M': fromDate.setMonth(toDate.getMonth() - 6); break;
      case 'YTD': fromDate.setFullYear(toDate.getFullYear(), 0, 1); break;
      case '1Y': fromDate.setFullYear(toDate.getFullYear() - 1); break;
      case '5Y': fromDate.setFullYear(toDate.getFullYear() - 5); break;
      case 'MAX': fromDate.setFullYear(1970); break;
    }
    return { from: fromDate.toISOString().split('T')[0], to: toDate.toISOString().split('T')[0] };
  };

  const getPolygonData = async (window: TimeWindow, ticker: string): Promise<PolygonResponse> => {
    const { from, to } = getDateRange(window);
    const apiKey = process.env.POLYGON_API_KEY;
    const multiplier = window === '1D' || window === '5D' ? '5' : '1';
    const timespan = window === '1D' || window === '5D' ? 'minute' : 'day';
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'ERROR') throw new Error(data.error || 'Failed to fetch data');
    return data;
  };

  const fetchData = async (window: TimeWindow) => {
    setLoading(true);
    setError(null);
    try {
      const polygonData = await getPolygonData(window, ticker);
      const transformedData = transformData(polygonData);

      if (transformedData.length >= 2) {
        const firstPrice = transformedData[0].price;
        const lastPrice = transformedData[transformedData.length - 1].price;
        const valueChange = lastPrice - firstPrice;
        const percentageChange = (valueChange / firstPrice) * 100;
        setPriceChange({
          value: parseFloat(valueChange.toFixed(2)),
          percentage: parseFloat(percentageChange.toFixed(2)),
        });
      } else {
        setPriceChange(null);
      }

      setData(transformedData);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(timeWindow); }, [timeWindow]);

  const formatXAxis = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, timeWindow === '1D' ? 'HH:mm' : 'MMM d');
    } catch {
      return '';
    }
  };

  const chartColors = getChartColors();

  return (
    <Card className="w-full border-none text-white bg-black h-96 flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <div className="text-3xl font-bold">
            {(data.length > 0 && data[data.length - 1].price) ? (
              <span>${data[data.length - 1]?.price.toFixed(2)}</span>
            ) : (
              <Skeleton className="h-14 w-32" />
            )}
          </div>
          {priceChange && (
            <p className={`text-xs ${priceChange.value >= 0 ? 'text-[#D4FF00]' : 'text-[#eb5757]'}`}>
              {priceChange.value >= 0 ? '+' : ''}{priceChange.value} ({priceChange.percentage}%)
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="secondary"
          className={`font-medium rounded-full ${timeWindow != '1D' && timeWindow != '5D' && "hidden"} ${isForecasting ? 'bg-gray-600' : 'bg-[#D4FF00] hover:opacity-80'}`}
          onClick={getForecast}
          disabled={isForecasting}
        >
          {isForecasting ? <Spinner size="small" /> : <AiOutlineStock />}
          Forecast
        </Button>
      </div>
      <div className="flex space-x-1 mb-4">
        {(['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'] as TimeWindow[]).map((window) => (
          <button
            key={window}
            onClick={() => { setTimeWindow(window); setShowForecast(false); }}
            className={`p-2 text-xs font-bold ${timeWindow === window ? `text-[${chartColors.primary}]` : ''}`}
          >
            {window}
          </button>
        ))}
      </div>
      {loading ? (
        <div className="flex justify-center items-center flex-grow">
          <Spinner size="medium" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center flex-grow">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid opacity={0} />
            <defs>
              <linearGradient id="dataGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.primary} stopOpacity={0.3} />
                <stop offset="100%" stopColor={chartColors.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis hide dataKey="date" stroke="#9ca3af" tickFormatter={formatXAxis} />
            <YAxis hide dataKey="price" domain={['dataMin', 'dataMax']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="linear"
              dataKey="price"
              stroke={chartColors.primary}
              fill="url(#dataGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
};

export default StockChart;
