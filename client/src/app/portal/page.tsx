"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { BsFillCloudArrowUpFill, BsFillCloudArrowDownFill } from "react-icons/bs";
import HeroSection from "@/components/Hero";

interface NewsArticle {
  id: string;
  title: string;
  published_utc: string;
  article_url: string;
  description: string;
}

interface MarketStatus {
  afterHours: boolean;
  earlyHours: boolean;
  market: string;
  currencies: {
    crypto: string;
    fx: string;
  };
  exchanges: {
    nasdaq: string;
    nyse: string;
    otc: string;
  };
  indicesGroups: {
    [key: string]: string;
  };
}

export default function Home() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [loadingNews, setLoadingNews] = useState<boolean>(true);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch functions remain the same...
  const fetchNewsArticles = async () => {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const url = `https://api.polygon.io/v2/reference/news?limit=20&apiKey=${apiKey}`;

    try {
      setLoadingNews(true);
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results) {
        setNewsArticles(data.results);
      } else {
        setError("Failed to load news articles.");
      }
    } catch (err) {
      setError("Error fetching news articles.");
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchMarketStatus = async () => {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    const url = `https://api.polygon.io/v1/marketstatus/now?apiKey=${apiKey}`;

    try {
      setLoadingStatus(true);
      const response = await fetch(url);
      const data = await response.json();
      setMarketStatus(data);
    } catch (err) {
      setError("Error fetching market status.");
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchNewsArticles();
    fetchMarketStatus();
  }, []);

  const StatusBadge = ({ status }: { status: string }) => {
    const getColors = (status: string) => {
      switch (status.toLowerCase()) {
        case "open":
          return "bg-green-500/20 text-green-400 border-green-500/50";
        case "closed":
          return "bg-red-500/20 text-red-400 border-red-500/50";
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/50";
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getColors(status)}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen text-white">
      <Navbar />
      <main className="container max-w-[1440px] mx-auto px-4 py-8 space-y-8 pt-24">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#D4FF00] to-green-400">
            Market Overview
          </h1>
          <p className="text-gray-400">Real-time market status and latest financial news</p>
        </div>

        {/* <Separator className="bg-gray-800" /> */}

        {/* Market Status Section */}
        {loadingStatus ? (
          <div className="flex justify-center items-center h-48">
            <Spinner size="large" className="text-[#D4FF00]" />
          </div>
        ) : marketStatus ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black border-none backdrop-blur-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BsFillCloudArrowUpFill className="text-[#D4FF00]" />
                  <span className="text-gray-400">Market Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Market</span>
                  <StatusBadge status={marketStatus.market} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">After Hours</span>
                    <Badge variant="default" className="bg-gray-800/50">
                      {marketStatus.afterHours ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Early Hours</span>
                    <Badge variant="default" className="bg-gray-800/50">
                      {marketStatus.earlyHours ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-none backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BsFillCloudArrowDownFill className="text-[#D4FF00]" />
                  <span className="text-gray-400">Currencies</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Crypto</span>
                  <StatusBadge status={marketStatus.currencies.crypto} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Forex</span>
                  <StatusBadge status={marketStatus.currencies.fx} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border-none backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BsFillCloudArrowDownFill className="text-[#D4FF00]" />
                  <span className="text-gray-400">Major Exchanges</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(marketStatus.exchanges).map(([exchange, status]) => (
                  <div key={exchange} className="flex items-center justify-between">
                    <span className="text-gray-400">{exchange.toUpperCase()}</span>
                    <StatusBadge status={status} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="col-span-full border-none bg-black backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <BsFillCloudArrowDownFill className="text-[#D4FF00]" />
                  <span className="text-gray-400">Indices Groups</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(marketStatus.indicesGroups).map(([index, status]) => (
                    <div key={index} className="flex flex-col space-y-2">
                      <span className="text-sm text-gray-400">{index.replace("_", " ").toUpperCase()}</span>
                      <StatusBadge status={status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-red-900/10 border-red-900">
            <CardContent className="text-red-400 text-center py-4">
              Error loading market status.
            </CardContent>
          </Card>
        )}

        {/* News Section */}
        <div className="space-y-6 mt-12">
          {/* <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-white">Latest News</h2>
          </div> */}

          {loadingNews ? (
            <div className="flex justify-center items-center h-48">
              <Spinner size="large" className="text-[#D4FF00]" />
            </div>
          ) : error ? (
            <Card className="bg-red-900/10 border-red-900">
              <CardContent className="text-red-400 text-center py-4">
                {error}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {newsArticles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-black border-none backdrop-blur-sm hover:bg-gray-300/5 transition-all"
                >
                  <a
                    href={article.article_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block py-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-[#D4FF00] hover:text-[#e0ff4d] transition-colors">
                          {article.title}
                        </h3>
                        <time className="text-sm text-gray-400">
                          {format(new Date(article.published_utc), "MMMM d, yyyy")}
                        </time>
                      </div>
                      <p className="text-gray-300 line-clamp-2">
                        {article.description}
                      </p>
                    </div>
                  </a>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}