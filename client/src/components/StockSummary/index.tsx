"use client";

import React, { useState, useEffect } from "react";
import OpenAI from "openai";
import { Spinner } from "../ui/spinner";
import { Card } from "../ui/card";
import { ArrowUpRight, ArrowDownRight, Circle, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface StockSummaryProps {
  ticker: string;
}

interface TimelineEvent {
  date: string;
  price: number;
  change: number;
  description: string;
}

const StockSummary: React.FC<StockSummaryProps> = ({ ticker }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ... (keeping existing fetch functions the same)
  const fetchStockData = async () => {
    const apiKey = process.env.POLYGON_API_KEY;
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 6);
    const from = fromDate.toISOString().split("T")[0];
    const to = new Date().toISOString().split("T")[0];

    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ERROR") {
      throw new Error(data.error || "Failed to fetch stock data.");
    }

    return data.results;
  };

  const generateTimeline = async (data: any[]) => {
    const significantChanges: TimelineEvent[] = [];

    for (let i = 1; i < data.length; i++) {
      const prevPrice = data[i - 1].c;
      const currPrice = data[i].c;
      const change = ((currPrice - prevPrice) / prevPrice) * 100;

      if (Math.abs(change) > 2) {
        significantChanges.push({
          date: new Date(data[i].t).toLocaleDateString(),
          price: currPrice,
          change: parseFloat(change.toFixed(2)),
          description: "",
        });
      }
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true,
    });

    const eventsWithDescriptions = await Promise.all(
      significantChanges.map(async (event) => {
        const prompt = `
          Analyze the following stock event:
          - Date: ${event.date}
          - Price: ${event.price}
          - Change: ${event.change}%

          Provide a concise description of potential reasons or market influences behind this change.
        `;
        const response = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 100,
        });

        return {
          ...event,
          description: response.choices[0]?.message.content || "No description available.",
        };
      })
    );

    return eventsWithDescriptions;
  };

  const fetchAndSummarize = async () => {
    setLoading(true);
    setError(null);
    try {
      const stockData = await fetchStockData();
      const timelineData = await generateTimeline(stockData);
      setTimeline(timelineData);
    } catch (err: any) {
      setError(err.message || "Failed to generate timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSummarize();
  }, [ticker]);

  const TimelineCard = ({ event, index }: { event: TimelineEvent; index: number }) => (
    <div className={`relative flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"
      }`}>
      {/* Timeline dot */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <Circle
          className={`h-4 w-4 ${event.change > 0 ? "text-green-400" : "text-red-400"
            }`}
          fill="currentColor"
        />
      </div>

      {/* Content card */}
      <div className={`w-5/12 no-underline ${index % 2 === 0 ? "pr-8" : "pl-8"}`}>
        <Accordion className="hover:no-underline" type="single" collapsible>
          <AccordionItem value={`event-${index}`} className="border-none">
            <AccordionTrigger className="bg-gray-800/60 rounded-t-lg p-4 hover:no-underline">
              <div className="flex items-center justify-between w-full">
                <span className="text-sm text-gray-400">{event.date}</span>
                <div className={`flex items-center ${event.change > 0 ? "text-green-400" : "text-red-400"
                  }`}>
                  {event.change > 0 ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="font-semibold">
                    {event.change > 0 ? "+" : ""}
                    {event.change}%
                  </span>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-gray-800/60 rounded-b-lg px-4 pb-4 pt-2">
              <p className="text-sm text-gray-300 mb-2">${event.price.toFixed(2)}</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                {event.description}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Empty space for opposite side */}
      <div className="w-5/12" />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <span className="px-3">Loading summary</span>
        <Spinner size="small" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="w-full bg-black border-none text-white p-6">
        <p className="text-red-500">{error}</p>
      </Card>
    );
  }

  // Calculate summary statistics
  const totalEvents = timeline.length;
  const positiveChanges = timeline.filter(event => event.change > 0).length;
  const negativeChanges = timeline.filter(event => event.change < 0).length;
  const biggestMove = timeline.reduce((max, event) =>
    Math.abs(event.change) > Math.abs(max.change) ? event : max,
    timeline[0] || { change: 0 }
  );

  return (
    <Card className="w-full border-none bg-black text-white p-6 no-underline px-0 decoration-black">
      <Accordion type="single" collapsible className="w-full no-underline">
        <AccordionItem value="timeline" className="border-none no-underline">
          <AccordionTrigger className="w-full hover:no-underline">
            <div className="w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold  !no-underline">
                  {ticker} Critical Summary (1M)
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                <div>
                  <p className="text-sm text-gray-400">Total Events</p>
                  <p className="text-lg font-semibold">{totalEvents}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Positive Changes</p>
                  <p className="text-lg font-semibold text-green-400">{positiveChanges}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Negative Changes</p>
                  <p className="text-lg font-semibold text-red-400">{negativeChanges}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Biggest Move</p>
                  <p className={`text-lg font-semibold ${biggestMove.change > 0 ? "text-green-400" : "text-red-400"
                    }`}>
                    {biggestMove.change > 0 ? "+" : ""}
                    {biggestMove.change}%
                  </p>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="mt-8 relative">
              {/* Vertical line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-px bg-gray-700" />

              <div className="space-y-8">
                {timeline.map((event, index) => (
                  <TimelineCard key={index} event={event} index={index} />
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default StockSummary;