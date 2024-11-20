'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../ui/card';
import { format, parseISO } from 'date-fns';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface StockCardProps {
  ticker: string;
  stockName: string;
}

interface PolygonDataPoint {
  c: number;
  t: number;
}

interface PolygonResponse {
  results: PolygonDataPoint[];
  status: string;
  error?: string;
}

interface StockDataPoint {
  date: string;
  price: number;
}

const StockCard: React.FC<StockCardProps> = ({ ticker, stockName }) => {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [priceChange, setPriceChange] = useState<{
    value: number;
    percentage: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.POLYGON_API_KEY;
      const toDate = new Date();
      const fromDate = new Date();
      fromDate.setDate(toDate.getDate() - 1);

      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];
      const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/5/minute/${from}/${to}?adjusted=true&sort=asc&limit=50000&apiKey=${apiKey}`;

      const response = await fetch(url);
      const polygonData: PolygonResponse = await response.json();

      if (polygonData.status == 'ERROR') {
        throw new Error(polygonData.error || 'Failed to fetch data');
      }

      const transformedData = polygonData.results.map((point) => ({
        date: new Date(point.t).toISOString().split('T')[0],
        price: point.c,
      }));

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
    fetchData();
  }, []);

  return (
    <Card onClick={() => router.push(`/quote/${ticker}`)} className="p-4 hover:cursor-pointer bg-black hover:bg-[#D4FF00] hover:bg-opacity-10 border-none text-white">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h3 className="text-lg font-semibold">{stockName}</h3>
          <p className="text-sm text-gray-400">{ticker}</p>
        </div>
        {priceChange && (
          <p className={`text-sm ${priceChange.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange.value >= 0 ? '+' : ''}
            {priceChange.value} ({priceChange.percentage >= 0 ? '+' : ''}
            {priceChange.percentage}%)
          </p>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-24">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-24">
          <p className="text-red-500">{error}</p>
        </div>
      ) : (
        <div className="h-24">
          <ResponsiveContainer>
            <LineChart data={data}>
              <Line
                type="monotone"
                dataKey="price"
                stroke="#D4FF00"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};

export default StockCard;
