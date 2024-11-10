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
}

interface StockChartProps {
  ticker: string;
  stockName: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    try {
      const date = parseISO(label);
      return (
        <div className="text-white bg-black p-2">
          <p className="text-sm">
            {format(date, 'MMM d, yyyy h:mm a')}
          </p>
          <p className="text-md">${payload[0].value.toFixed(2)}</p>
        </div>
      );
    } catch (error) {
      return null;
    }
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

  // Define consistent colors based on price change
  const getChartColors = () => {
    const isPositive = priceChange && priceChange.value >= 0;
    return {
      primary: isPositive ? '#D4FF00' : '#eb5757',
      secondary: isPositive ? '#D4FF00' : '#eb5757'
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

  const getDateRange = (window: TimeWindow): { from: string; to: string } => {
    const toDate = new Date();
    let fromDate = new Date();

    switch (window) {
      case '1D':
        toDate.setDate(toDate.getDate() - 1)
        fromDate.setDate(toDate.getDate() - 1);
        break;
      case '5D':
        fromDate.setDate(toDate.getDate() - 5);
        break;
      case '1M':
        fromDate.setMonth(toDate.getMonth() - 1);
        break;
      case '6M':
        fromDate.setMonth(toDate.getMonth() - 6);
        break;
      case 'YTD':
        fromDate = new Date(toDate.getFullYear(), 0, 1);
        break;
      case '1Y':
        fromDate.setFullYear(toDate.getFullYear() - 1);
        break;
      case '5Y':
        fromDate.setFullYear(toDate.getFullYear() - 5);
        break;
      case 'MAX':
        fromDate = new Date(1970, 0, 1);
        break;
    }

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

    const multiplier = window === '1D' || window === '5D' ? '5' : '1';
    const timespan = window === '1D' || window === '5D' ? 'minute' : 'day';

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

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
    try {
      const date = parseISO(dateString);
      switch (timeWindow) {
        case '1D':
          return format(date, 'HH:mm');
        case '5D':
          return format(date, 'MMM d');
        case '1M':
          return format(date, 'MMM d');
        case '6M':
        case 'YTD':
        case '1Y':
        case '5Y':
        case 'MAX':
          return format(date, 'MMM yyyy');
        default:
          return format(date, 'MMM d, yyyy');
      }
    } catch (error) {
      return '';
    }
  };

  const chartColors = getChartColors();

  return (
    <Card className="w-full border-none text-white bg-black h-96 flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <div className='text-3xl font-bold'>
            {(data.length > 0 && data[data.length - 1].price) ? (
              <span>
                ${data[data.length - 1]?.price.toFixed(2)}
              </span>
            ) : (
              <Skeleton className="h-14 w-32" />
            )}
          </div>
          {priceChange && (
            <p className={`text-xs flex items-center gap-1 ${priceChange.value >= 0 ? 'text-[#D4FF00]' : 'text-[#eb5757]'}`}>
              {priceChange.value >= 0 ? '+' : ''}
              {priceChange.value} ({priceChange.percentage >= 0 ? '+' : ''}
              {priceChange.percentage}%){' '}
              <span className='text-white'>{timeWindow === '1D' ? 'Today' : `Past ${timeWindow.toUpperCase()}`}</span>
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="secondary"
          className={`font-medium ${priceChange && priceChange.value >= 0 ? 'bg-[#D4FF00] hover:bg-[#D4FF00]' : 'bg-[#eb5757] hover:bg-[#eb5757]'}`}
        >
          <AiOutlineStock />
          Forecast
        </Button>
      </div>
      <div className="flex space-x-1 mb-4">
        {timeWindows.map((window) => (
          <button
            key={window}
            onClick={() => setTimeWindow(window)}
            className={`${timeWindow === window ? `text-[${chartColors.primary}] border-b border-[${chartColors.primary}]` : ""} text-medium hover:text-[${chartColors.primary}] p-2 text-xs font-bold transition-all`}
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
              <CartesianGrid opacity={0} />
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={chartColors.primary}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor={chartColors.primary}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tickCount={5}
                tickFormatter={formatXAxis}
                axisLine={false}
                tickLine={false}
                tick={false}
              />
              <YAxis
                hide
                dataKey="price"
                domain={['dataMin', 'dataMax']}
                tickLine={false}
                tick={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />

              <Area
                type="linear"
                dataKey="price"
                stroke={chartColors.primary}
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