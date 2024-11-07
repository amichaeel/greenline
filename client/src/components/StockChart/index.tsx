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
}

interface StockChartProps {
  ticker: string;
  stockName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Check if label is a date or datetime and format accordingly
    const formatLabel = (label: string) => {
      // If label includes 'T', it's likely a datetime
      if (label.includes('T')) {
        const date = new Date(label);
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
        });
      } else {
        // If label is a plain date in MM-DD-YYYY, parse it and format
        const [month, day, year] = label.split('-');
        const date = new Date(+year, +month - 1, +day);
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    };

    return (
      <div className="text-white bg-black p-2">
        <p className="text-sm">{formatLabel(label)}</p>
        <p className="text-md">${payload[0].value.toFixed(2)}</p>
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
  const [priceChange, setPriceChange] = useState<{
    value: number;
    percentage: number;
  } | null>(null);

  const transformData = (data: PolygonResponse): StockDataPoint[] => {
    return data.results.map((point) => {
      const date = new Date(point.t);
      const formattedDate =
        timeWindow === '1D' || timeWindow === '5D'
          ? date.toISOString()
          : date.toISOString().split('T')[0];
      return {
        date: formattedDate,
        price: point.c,
      };
    });
  };

  const getDateRange = (window: TimeWindow): { from: string; to: string } => {
    const toDate = new Date();
    let fromDate = new Date();

    switch (window) {
      case '1D':
        fromDate = new Date(toDate);
        fromDate.setDate(fromDate.getDate() - 1);
        break;
      case '5D':
        fromDate = new Date(toDate);
        fromDate.setDate(fromDate.getDate() - 5);
        break;
      case '1M':
        fromDate = new Date(toDate);
        fromDate.setMonth(fromDate.getMonth() - 1);
        break;
      case '6M':
        fromDate = new Date(toDate);
        fromDate.setMonth(fromDate.getMonth() - 6);
        break;
      case 'YTD':
        fromDate = new Date(toDate.getFullYear(), 0, 1);
        break;
      case '1Y':
        fromDate = new Date(toDate);
        fromDate.setFullYear(fromDate.getFullYear() - 1);
        break;
      case '5Y':
        fromDate = new Date(toDate);
        fromDate.setFullYear(fromDate.getFullYear() - 5);
        break;
      case 'MAX':
        fromDate = new Date(1970, 0, 1);
        break;
    }

    // Format dates to 'YYYY-MM-DD'
    const from = fromDate.toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];

    return { from, to };
  };

  const getPolygonData = async (
    window: TimeWindow,
    ticker: string
  ): Promise<PolygonResponse> => {
    const { from, to } = getDateRange(window);
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const granularity = window === '1D' || window === '5D' ? '5/minute' : '1/day';
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${granularity}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'ERROR') {
      throw new Error(data.error || 'Failed to fetch data');
    }

    return data;
  };

  const timeWindows: TimeWindow[] = ['1D', '5D', '1M', '6M', 'YTD', '1Y', '5Y', 'MAX'];

  const fetchData = async (window: TimeWindow) => {
    setLoading(true);
    setError(null);
    try {
      const polygonData: PolygonResponse = await getPolygonData(window, ticker);
      const transformedData = transformData(polygonData);

      // Calculate price change
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

  useEffect(() => {
    fetchData(timeWindow);
  }, [timeWindow]);

  const formatXAxis = (dateString: string) => {
    const date = parseISO(dateString);
    switch (timeWindow) {
      case '1D':
        return format(date, 'HH:mm'); // Hours and minutes
      case '5D':
        return format(date, 'MMM d'); // Abbreviated month and day
      case '1M':
        return format(date, 'MMM d'); // Abbreviated month and day
      case '6M':
      case 'YTD':
      case '1Y':
      case '5Y':
      case 'MAX':
        return format(date, 'MMM yyyy'); // Abbreviated month and year
      default:
        return dateString;
    }
  };

  return (
    <Card className="w-full border-none text-white bg-black h-96 flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          {/* <h2 className="text-xl font-semibold">
            {stockName} ({ticker})
          </h2> */}
          <h2 className='text-3xl font-bold'>
            ${data[data.length - 1]?.price.toFixed(2)}
          </h2>
          {priceChange && (
            <p
              className={`text-xs flex items-center gap-1 ${priceChange.value >= 0 ? 'text-[#D4FF00]' : 'text-red-500'}`}
            >
              {priceChange.value >= 0 ? '+' : ''}
              {priceChange.value} ({priceChange.percentage >= 0 ? '+' : ''}
              {priceChange.percentage}%){' '}
              <p className='text-white'>{timeWindow === '1D' ? 'Today' : `Past ${timeWindow.toUpperCase()}`}</p>
            </p>
          )}
        </div>
        <Button size={"sm"} variant={"secondary"} className='bg-[#D4FF00] font-medium hover:bg-[#D4FF00]' >
          <AiOutlineStock />
          Forecast
        </Button>
      </div>
      <div className="flex space-x-1 mb-4">
        {timeWindows.map((window) => (
          <button
            key={window}
            onClick={() => setTimeWindow(window)}
            className={`${timeWindow === window ? "text-[#D4FF00] border-b border-[#D4FF00]" : ""} text-medium hover:text-[#D4FF00] p-2 text-xs font-bold transition-all `}
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
        <div className="flex-grow">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.1} />
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={priceChange && priceChange.value >= 0 ? '#D4FF00' : '#eb5757'}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={priceChange && priceChange.value >= 0 ? '#D4FF00' : '#eb5757'}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date" stroke="#9ca3af"
                tickCount={5}
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis
                dataKey="price"
                orientation="right"
                stroke="#9ca3af"
                axisLine={{ stroke: '#eb575789', strokeWidth: 1 }}
                domain={['dataMin', 'dataMax']}
                tickLine={false}
                type="number"
                tickFormatter={(value) =>
                  `$${value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                }
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />

              {/* Area component to fill below the line */}
              <Area
                type="monotone"
                dataKey="price"
                stroke={priceChange && priceChange.value >= 0 ? '#D4FF00' : '#eb5757'}
                fillOpacity={1}
                fill="url(#priceGradient)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default StockChart;
