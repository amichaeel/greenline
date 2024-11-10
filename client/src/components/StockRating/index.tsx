"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "../ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

interface RatingData {
  symbol: string;
  date: string;
  rating: string;
  ratingScore: number;
  ratingRecommendation: string;
  ratingDetailsDCFScore: number;
  ratingDetailsDCFRecommendation: string;
  ratingDetailsROEScore: number;
  ratingDetailsROERecommendation: string;
  ratingDetailsROAScore: number;
  ratingDetailsROARecommendation: string;
  ratingDetailsDEScore: number;
  ratingDetailsDERecommendation: string;
  ratingDetailsPEScore: number;
  ratingDetailsPERecommendation: string;
  ratingDetailsPBScore: number;
  ratingDetailsPBRecommendation: string;
}

interface StockRatingProps {
  ticker: string;
}

const StockRating: React.FC<StockRatingProps> = ({ ticker }) => {
  const [ratingData, setRatingData] = useState<RatingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRating = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://financialmodelingprep.com/api/v3/rating/${ticker}?apikey=z00pmv1R647g3wa404anMdADxAoIxzmP`
        );
        const data = await response.json();
        if (data && data[0]) {
          setRatingData(data[0]);
        } else {
          setError("No rating data available");
        }
      } catch (err) {
        setError("Failed to fetch rating data");
      }
      setLoading(false);
    };

    fetchRating();
  }, [ticker]);

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-[#D4FF00]";
    if (score >= 3) return "text-yellow-500";
    return "text-[#eb5757]";
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation.toLowerCase()) {
      case "strong buy":
      case "buy":
        return "text-[#D4FF00]";
      case "neutral":
        return "text-yellow-500";
      case "sell":
      case "strong sell":
        return "text-[#eb5757]";
      default:
        return "text-white";
    }
  };

  if (loading) {
    return (
      <Card className="w-full border-none text-white bg-black">
        <CardContent className="flex justify-center items-center h-48">
          <Spinner size="medium" />
        </CardContent>
      </Card>
    );
  }

  if (error || !ratingData) {
    return (
      <Card className="w-full border-none text-white bg-black">
        <CardContent className="flex justify-center items-center h-48">
          <p className="text-red-500">{error || "No data available"}</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate percentages for each recommendation type
  const getRecommendationCounts = () => {
    const recommendations = [
      ratingData.ratingDetailsDCFRecommendation,
      ratingData.ratingDetailsROERecommendation,
      ratingData.ratingDetailsROARecommendation,
      ratingData.ratingDetailsDERecommendation,
      ratingData.ratingDetailsPERecommendation,
      ratingData.ratingDetailsPBRecommendation
    ];

    const total = recommendations.length;
    const counts = {
      buy: recommendations.filter(r => r.toLowerCase().includes('buy')).length,
      hold: recommendations.filter(r => r.toLowerCase().includes('neutral')).length,
      sell: recommendations.filter(r => r.toLowerCase().includes('sell')).length
    };

    return {
      buy: (counts.buy / total) * 100,
      hold: (counts.hold / total) * 100,
      sell: (counts.sell / total) * 100,
      total: total
    };
  };

  const recommendationCounts = getRecommendationCounts();

  const metrics = [
    { name: "DCF (Discounted Cash Flow)", score: ratingData.ratingDetailsDCFScore, recommendation: ratingData.ratingDetailsDCFRecommendation },
    { name: "ROE (Return on Equity)", score: ratingData.ratingDetailsROEScore, recommendation: ratingData.ratingDetailsROERecommendation },
    { name: "ROA (Return on Assets)", score: ratingData.ratingDetailsROAScore, recommendation: ratingData.ratingDetailsROARecommendation },
    { name: "DE (Debt to Equity)", score: ratingData.ratingDetailsDEScore, recommendation: ratingData.ratingDetailsDERecommendation },
    { name: "PE (Price to Earnings)", score: ratingData.ratingDetailsPEScore, recommendation: ratingData.ratingDetailsPERecommendation },
    { name: "PB (Price to Book)", score: ratingData.ratingDetailsPBScore, recommendation: ratingData.ratingDetailsPBRecommendation },
  ];

  return (
    <Card className="w-full border-none text-white bg-black py-6">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-semibold">Rating Analysis</h2>
        <div className="text-right">
          <div className="text-3xl font-bold">
            <span className={getScoreColor(ratingData.ratingScore)}>
              {ratingData.rating}
            </span>
          </div>
          <div className={`text-lg ${getRecommendationColor(ratingData.ratingRecommendation)}`}>
            {ratingData.ratingRecommendation}
          </div>
        </div>
      </div>

      <div className="flex gap-8 items-center mb-8">
        <div className="relative w-32 h-32 rounded-full bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-[#D4FF00]">
              {Math.round(recommendationCounts.buy)}%
            </div>
            <div className="text-xs text-[#D4FF00]">
              of {recommendationCounts.total} metrics
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className='font-semibold'>Buy</span>
              <span>{recommendationCounts.buy.toFixed(1)}%</span>
            </div>
            <Progress
              value={recommendationCounts.buy}
              className="h-2 bg-neutral-800 [&>*]:bg-[#D4FF00]"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className='font-semibold'>Hold</span>
              <span>{recommendationCounts.hold.toFixed(1)}%</span>
            </div>
            <Progress
              value={recommendationCounts.hold}
              className="h-2 bg-neutral-800 [&>*]:bg-yellow-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className='font-semibold'>Sell</span>
              <span>{recommendationCounts.sell.toFixed(1)}%</span>
            </div>
            <Progress
              value={recommendationCounts.sell}
              className="h-2 bg-neutral-900 [&>*]:bg-[#eb5757]"
            />
          </div>
        </div>
      </div>

      <Separator className="my-6 bg-neutral-800" />

      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Detailed Metrics</h3>
        <Table>
          <TableBody>
            {metrics.map((metric) => (
              <TableRow key={metric.name} className="border-none hover:bg-neutral-700">
                <TableCell className="pl-0 py-2">
                  <div className="font-medium">{metric.name}</div>
                </TableCell>
                <TableCell className="text-right py-2">
                  <div className="flex items-center justify-end gap-4">
                    <span className={`font-bold ${getScoreColor(metric.score)}`}>
                      {metric.score}/5
                    </span>
                    <span className={`${getRecommendationColor(metric.recommendation)}`}>
                      {metric.recommendation}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        Last updated: {new Date(ratingData.date).toLocaleDateString()}
      </div>
    </Card>
  );
};

export default StockRating;