import pandas as pd
import numpy as np
import plotly.graph_objects as go
from alpha_vantage.timeseries import TimeSeries
from sklearn.preprocessing import MinMaxScaler
from keras import Sequential, layers


API_KEY = 'MPU7B14C0RPZ0HBT'

# Initialize Alpha Vantage API client
ts = TimeSeries(key=API_KEY, output_format='pandas')

# Fetch intraday data (e.g., 1-minute intervals for the last 24 hours)
symbol = 'AAPL'  # You can replace this with any stock symbol
data, meta_data = ts.get_intraday(symbol=symbol, interval='1min', outputsize='full')

# Filter for the past 24 hours
data.index = pd.to_datetime(data.index)
now = pd.Timestamp.now()
last_24_hours = data[data.index > now - pd.Timedelta(days=1)]
last_24_hours = last_24_hours[['4. close']]  # Use the 'close' price

# Prepare the data for LSTM
scaler = MinMaxScaler(feature_range=(0, 1))  # Scale between 0 and 1
scaled_data = scaler.fit_transform(last_24_hours)

# Create a training dataset (80% of the data)
training_data_len = int(np.ceil(len(scaled_data) * 0.8))
train_data = scaled_data[:training_data_len]

# Create the training dataset
X_train = []
y_train = []

# Use 60 previous minutes to predict the next one
for i in range(60, len(train_data)):
    X_train.append(train_data[i-60:i, 0])  # 60 previous prices
    y_train.append(train_data[i, 0])       # Predict the next price

X_train, y_train = np.array(X_train), np.array(y_train)

# Reshape data for LSTM [samples, time steps, features]
X_train = np.reshape(X_train, (X_train.shape[0], X_train.shape[1], 1))

# Build the LSTM model
model = Sequential()

# First LSTM layer with Dropout
model.add(layers.LSTM(units=50, return_sequences=True, input_shape=(X_train.shape[1], 1)))
model.add(layers.Dropout(0.2))

# Second LSTM layer with Dropout
model.add(layers.LSTM(units=50, return_sequences=False))
model.add(layers.Dropout(0.2))

# Add a Dense layer
model.add(layers.Dense(units=25))

# Output layer
model.add(Dense(units=1))

# Compile the model
model.compile(optimizer='adam', loss='mean_squared_error')

# Train the model
model.fit(X_train, y_train, batch_size=64, epochs=5)

# Create testing dataset
test_data = scaled_data[training_data_len - 60:, :]  # Include last 60 from training

# Create datasets for X_test and y_test
X_test = []
y_test = last_24_hours[training_data_len:].values  # True values (unscaled)

for i in range(60, len(test_data)):
    X_test.append(test_data[i-60:i, 0])

X_test = np.array(X_test)

# Reshape the data for LSTM [samples, time steps, features]
X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))

# Get the model's predicted values
predictions = model.predict(X_test)
predictions = scaler.inverse_transform(predictions)  # Unscale the predictions

# Plot the results
fig = go.Figure()

# Plot actual stock prices
fig.add_trace(go.Scatter(x=last_24_hours.index[training_data_len:], y=y_test.flatten(),
                         mode='lines', name='Actual Stock Price'))

# Plot predicted stock prices
fig.add_trace(go.Scatter(x=last_24_hours.index[training_data_len:], y=predictions.flatten(),
                         mode='lines', name='Predicted Stock Price'))

# Customize the layout
fig.update_layout(title=f'{symbol} Stock Price Prediction (LSTM)',
                  xaxis_title='Time',
                  yaxis_title='Stock Price',
                  template='plotly_dark')

# Show the plot
fig.show()
