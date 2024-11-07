'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Spinner } from '../ui/spinner';

interface NewsArticle {
  id: string;
  title: string;
  article_url: string;
  published_utc: string;
  author: string;
  description: string;
  image_url: string;
  publisher: {
    name: string;
    logo_url: string;
    favicon_url: string;
    homepage_url: string;
  };
}

interface NewsResponse {
  results: NewsArticle[];
  status: string;
  error?: string;
}

interface NewsSectionProps {
  ticker: string;
}

const NewsSection: React.FC<NewsSectionProps> = ({ ticker }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
      const url = `https://api.polygon.io/v2/reference/news?ticker=${ticker}&limit=10&apiKey=${apiKey}`;

      const response = await fetch(url);
      const newsData: NewsResponse = await response.json();

      if (newsData.status !== 'OK') {
        throw new Error(newsData.error || 'Failed to fetch news');
      }

      setNews(newsData.results);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, [ticker]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4">{ticker} News</h2>
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <Spinner size="medium" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-red-500">{error}</p>
        </div>
      ) : news.length > 0 ? (
        <div className="space-y-4">
          {news.map((article) => (
            <Card key={article.id} className="p-4 border-none bg-black rounded-none hover:bg-gray-300 hover:bg-opacity-10 transition-all">
              <a href={article.article_url} target="_blank" rel="noopener noreferrer">
                <div className="flex">
                  {article.image_url && (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-32 h-20 object-cover rounded-md mr-4"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-white">{article.title}</h3>
                    <p className="text-sm text-gray-400">
                      {new Date(article.published_utc).toLocaleString()} by {article.author}
                    </p>
                    <p className="text-gray-300 mt-2">{article.description}</p>
                  </div>
                </div>
              </a>
            </Card>
          ))}
        </div>
      ) : (
        <p>No news articles found for {ticker}.</p>
      )}
    </div>
  );
};

export default NewsSection;
