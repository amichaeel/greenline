"use client";

import React, { useState, useEffect } from 'react';
import StockChart from '@/components/StockChart';
import Navbar from '@/components/Navbar';
import NewsSection from '@/components/NewsSection';
import StockCardMini from '@/components/StockCardMini';
import { Spinner } from '@/components/ui/spinner';
import { CiCirclePlus } from "react-icons/ci";
import StockRating from '@/components/StockRating';
import TickerChat from '@/components/TickerChat';
import StockSummary from '@/components/StockSummary';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface StockPageProps {
  params: {
    ticker: string;
  };
}

interface TickerData {
  ticker: string;
}

interface StockInfo {
  name: string;
  description: string;
  market_cap: number;
  logo_url: string;
  website: string;
  phone_number: string;
  total_employees: number;
  industry: string;
  primary_exchange: string;
}

const StockPage: React.FC<StockPageProps> = ({ params }) => {
  const ticker = params.ticker.toUpperCase();
  const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [relatedTickers, setRelatedTickers] = useState<string[]>([]);

  const fetchStockInfo = async () => {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const url = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results) {
        const { name, description, market_cap, branding, homepage_url, phone_number, total_employees, sic_description, primary_exchange } = data.results;
        setStockInfo({
          name,
          description,
          market_cap,
          logo_url: branding?.icon_url + `?apiKey=${apiKey}` || '',
          website: homepage_url || '',
          phone_number: phone_number || '',
          total_employees: total_employees,
          industry: sic_description,
          primary_exchange: primary_exchange
        });
      } else {
        setError("Failed to load stock information.");
      }
    } catch (err) {
      setError("Error fetching stock information.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedCompanies = async () => {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const url = `https://api.polygon.io/v1/related-companies/${ticker}?apiKey=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK') {
        setRelatedTickers(data.results.map((res: TickerData) => res.ticker) || []);
      } else {
        console.error("Failed to load related companies.");
      }
    } catch (err) {
      console.error("Error fetching related companies:", err);
    }
  };

  useEffect(() => {
    fetchStockInfo();
    fetchRelatedCompanies();
  }, [ticker]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex justify-center items-center">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white font-sans flex justify-center items-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!stockInfo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans mt-20">
      <Navbar />
      <div className="container max-w-[1440px] mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className='flex items-center'>
            {!stockInfo.logo_url.includes('undefined') ? (
              <img src={stockInfo.logo_url} alt={`${stockInfo.name} logo`} className="h-12 w-12 mr-4" />
            ) : (
              <div></div>
            )}
            <div>
              <h1 className="text-2xl font-semibold">{stockInfo.name} ({ticker})</h1>
              {/* {stockInfo.website && (
                <a href={stockInfo.website} target="_blank" rel="noopener noreferrer" className="text-[#D4FF00] text-xs">
                  {stockInfo.website}
                </a>
              )} */}
            </div>
          </div>
          <div className='text-[#D4FF00] hover:bg-[#D4FF00]/30 hover:cursor-pointer px-4 py-1 font-semibold text-sm rounded-xl flex items-center space-x-2'>
            <span>Add to Watchlist</span>
            <CiCirclePlus size={20} />
          </div>
        </div>
        {/* <p className="text-lg font-medium mb-6">
          Market Cap: ${stockInfo.market_cap?.toLocaleString()}
        </p> */}

        <StockChart ticker={ticker} stockName={stockInfo.name} />
        <TickerChat ticker={ticker} />
        <StockSummary ticker={ticker} />
        <Accordion defaultValue="item-1" type="single" className="w-full" collapsible>
          <AccordionItem value="item-1" className='border-none p-1'>
            <AccordionTrigger className='text-2xl font-semibold'>{stockInfo.name} Overview</AccordionTrigger>
            <AccordionContent>
              <div className='grid grid-cols-2 gap-12 justify-between'>
                <p className="text-sm text-gray-400 mb-4">{stockInfo.description}</p>
                <div className='text-white grid grid-cols-2'>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{stockInfo.total_employees?.toLocaleString()}</span>
                    <span className='text-xs'>Full Time Employees</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{stockInfo.phone_number}</span>
                    <span className='text-xs'>Phone Number</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{stockInfo.industry}</span>
                    <span className='text-xs'>Industry</span>
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{stockInfo.primary_exchange}</span>
                    <span className='text-xs'>Primary Exchange</span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {/* Similar Stocks Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Related Stocks</h2>
          <div className="flex space-x-4 overflow-x-auto scrollbar-none">
            {relatedTickers.map((relatedTicker) => (
              <div className="flex-shrink-0 w-48">
                <StockCardMini key={relatedTicker} ticker={relatedTicker} />
              </div>
            ))}
          </div>
        </div>
        <StockRating ticker={ticker} />
        <NewsSection ticker={ticker} />
      </div>
    </div >
  );
};

export default StockPage;
