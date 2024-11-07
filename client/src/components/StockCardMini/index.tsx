"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '../ui/spinner';

interface StockCardMiniProps {
  ticker: string;
}

interface StockInfo {
  name: string;
  market_cap: number;
  industry: string;
  price: number;
  logo_url: string;
}

const StockCardMini: React.FC<StockCardMiniProps> = ({ ticker }) => {
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchStockData = async () => {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        const { name, market_cap, sic_description, branding } = data.results;
        const priceUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
        const priceResponse = await fetch(priceUrl);
        const priceData = await priceResponse.json();
        const price = priceData.results?.[0]?.c || 0;

        setStockInfo({
          name,
          market_cap,
          industry: sic_description || 'Unknown',
          price,
          logo_url: branding?.icon_url || '',
        });
      } else {
        setError("Failed to load stock data.");
      }
    } catch (err) {
      setError("Error fetching stock data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, [ticker]);

  if (loading) {
    return <Spinner size="small" />;
  }

  if (error || !stockInfo) {
    return <p className="text-red-500">Error</p>;
  }

  return (
    <div className="rounded-lg p-4 border-1 border-white w-54 h-36 text-white">
      <div onClick={() => router.push(`/quote/${ticker}`)} className="flex hover:cursor-pointer items-center mb-2">
        {stockInfo.logo_url && (
          <img src={`${stockInfo.logo_url}?apiKey=${process.env.NEXT_PUBLIC_POLYGON_API_KEY}`} alt={`${stockInfo.name} logo`} className="h-6 w-6 mr-2" />
        )}
        <h3 className="text-sm font-semibold">{ticker}</h3>
      </div>
      <p className="text-xs text-gray-400 overflow-hidden text-ellipsis text-nowrap">{stockInfo.name}</p>
      <p className="text-xs font-bold">${stockInfo.price.toFixed(2)}</p>
      <p className={`text-xs font-medium ${stockInfo.price >= 0 ? 'text-[#D4FF00]' : 'text-red-500'}`}>
        {((stockInfo.price - stockInfo.market_cap) / stockInfo.market_cap * 100).toFixed(2)}%
      </p>
      <div className='flex justify-between text-xs text-gray-400 mt-2'>
        <span>Mkt Cap</span>
        <span>{Math.round(stockInfo.market_cap / 1e9)}B</span>
      </div>
      {/* <p className="text-xs text-gray-400">Industry {stockInfo.industry}</p> */}
    </div>
  );
};

export default StockCardMini;
