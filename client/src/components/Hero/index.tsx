"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

interface MarketData {
  ticker: string;
  price: number;
  change: number;
}

const MarketTicker = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const tickers = ['SPY', 'QQQ', 'BTC', 'ETH', 'AAPL', 'MSFT', 'NFLX'];
        const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;

        const promises = tickers.map(async (ticker) => {
          const response = await fetch(
            `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`
          );
          const data = await response.json();
          console.log(data)

          if (data.results && data.results[0]) {
            const result = data.results[0];
            return {
              ticker,
              price: result.c,
              change: ((result.c - result.o) / result.o) * 100
            };
          }
          return null;
        });

        const results = (await Promise.all(promises)).filter(Boolean);
        setMarketData(results as MarketData[]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching market data:', error);
        setLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  return (
    <div className="w-full overflow-hidden h-14 border-b border-[#D4FF00]/10 backdrop-blur-sm bg-black/30">
      <div className="h-full flex items-center justify-between px-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-2 bg-black shrink-0">
          <Globe className="h-4 w-4 text-[#D4FF00]" />
          <span className="text-[#D4FF00] text-sm font-medium">LIVE MARKETS</span>
        </div>

        <div className="overflow-x-auto scrollbar-none ml-8" style={{ msOverflowStyle: 'none' }}>
          {loading ? (
            <div className="text-gray-500 text-sm">Loading market data...</div>
          ) : (
            <div className="flex items-center gap-8 px-4 text-sm">
              {marketData.map((item) => (
                <span key={item.ticker} className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-400 font-medium">{item.ticker}</span>
                  <span className="text-white">${item.price.toFixed(2)}</span>
                  <span className={`${item.change >= 0 ? 'text-[#D4FF00]' : 'text-red-500'}`}>
                    {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                  </span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HeroSection = () => {
  return (
    <div className="relative min-h-screen bg-black overflow-hidden pt-16">
      <MarketTicker />

      {/* Decorative elements */}
      {/* <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#D4FF00]/5 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#D4FF00]/5 rounded-full filter blur-[120px]" />

        Grid lines
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, rgba(212, 255, 0, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(212, 255, 0, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />

        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#D4FF00]/50 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div> */}

      {/* Main content */}
      <div className="relative pt-4 px-4 bg-gradient-to-b from-white/10 to-black">
        <div className="max-w-[1440px]  flex items-center justify-center flex-col mx-auto">
          {/* Main text content */}
          <div className="space-y-8 w-full flex flex-col items-center justify-center max-w-[1440px]">
            <h1 className="text-6xl py-36 lg:text-7xl font-serif font-extralight leading-tight tracking-tight">
              <span className="text-white">Advanced Market</span>
              <br />
              <div className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D4FF00] to-green-400">
                  Intelligence Platform
                </span>
                <div className="absolute top-0 -right-8 w-6 h-6 border border-[#D4FF00]/30 rounded-full animate-spin-slow" />
              </div>
              <p className="text-lg pt-6 text-gray-400 max-w-2xl leading-relaxed tracking-wide">
                Harness the power of advanced algorithms and real-time market data.
                <br />
                Make informed decisions with institutional-grade analytics.
              </p>
            </h1>


            {/* CTA section */}
            {/* Main text content */}

            {/* Features and CTA section */}
            <div className="grid lg:grid-cols-2 gap-12 pb-8">
              {/* Features */}
              <div className="space-y-4">
                {[
                  { title: 'REAL-TIME ANALYTICS', desc: 'Live market data and instant analysis' },
                  { title: 'PREDICTIVE AI', desc: 'Advanced machine learning models' },
                  { title: 'INSTITUTIONAL GRADE', desc: 'Professional trading tools' }
                ].map((feature) => (
                  <div
                    key={feature.title}
                    className="group border border-[#D4FF00]/10 bg-black/30 backdrop-blur-sm p-6 rounded-lg 
                     hover:border-[#D4FF00]/20 transition-all duration-300"
                  >
                    <div className="text-sm text-[#D4FF00] font-medium tracking-wide mb-2">{feature.title}</div>
                    <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                    <div className="h-1 w-12 bg-gradient-to-r from-[#D4FF00] to-transparent rounded-full mt-4 
                         opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              {/* CTA Section */}
              <div className="flex flex-col gap-8 lg:gap-0">
                <div className="space-y-4">
                  <h3 className="text-2xl font-semibold text-white leading-tight">
                    Discover Next-Gen Trading
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Unlock market insights powered by machine learning:
                    <span className="text-[#D4FF00]"> Price Predictions</span>,
                    <span className="text-[#D4FF00]"> Market Trends</span>, and
                    <span className="text-[#D4FF00]"> Risk Analysis</span>.
                    Make data-driven decisions with confidence.
                  </p>
                </div>

                <Link href="/portal" className="block sm:inline-block mt-8 lg:mt-0">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto group relative bg-[#D4FF00] lg:mt-12 rounded-full text-black 
                     hover:bg-[#D4FF00]/90 text-lg px-8 py-6 font-medium tracking-wide 
                     transition-all duration-300
                     hover:shadow-lg hover:shadow-[#D4FF00]/20"
                  >
                    <span className="flex font-sans items-center justify-center gap-2">
                      Access Portal
                      <ArrowRight className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative bg-white text-black w-screen overflow-hidden py-24">
            <div className="max-w-7xl mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Left side with text */}
                <div className="space-y-6">
                  <h2 className="text-4xl lg:text-5xl font-extralight leading-tight">
                    Why choose our platform?
                  </h2>
                  <div className="space-y-8">
                    {[
                      {
                        title: "Advanced AI Models",
                        description: "Our neural networks process millions of data points to identify patterns humans might miss."
                      },
                      {
                        title: "Real-Time Processing",
                        description: "Get instant insights as market conditions change, staying ahead of market movements."
                      },
                      {
                        title: "Proven Accuracy",
                        description: "Machine learning models trained on decades of historical data for reliable predictions."
                      }
                    ].map((item, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="h-8 w-8 rounded-full bg-[#D4FF00] flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                          <p className="text-gray-600 leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side with stats */}
                <div className="relative">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { metric: "90%", label: "Prediction Accuracy" },
                      { metric: "<50ms", label: "Processing Time" },
                      { metric: "24/7", label: "Market Coverage" },
                      { metric: "1M+", label: "Data Points Analyzed" }
                    ].map((stat, index) => (
                      <div
                        key={index}
                        className="p-8"
                      >
                        <div className="text-black text-4xl font-bold mb-2">
                          {stat.metric}
                        </div>
                        <div className="text-neutral-700 text-sm">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#D4FF00]/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#D4FF00]/10 rounded-full blur-2xl" />
                </div>
              </div>
            </div>
          </div>
          <div className="relative bg-gradient-to-b from-[#D4FF00] to-[#000000] pb-64 text-black w-screen overflow-hidden">

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center min-h-full h-[700px] text-center">
              <Image
                src="/greenline-logo-icon-transparent.png"
                width={40}
                height={40}
                alt="Greenline Logo"
              />
              <h2 className="text-black text-5xl md:text-7xl font-serif mb-8 leading-tight max-w-4xl">
                Make smarter
                <br />
                trading decisions
              </h2>

              <Link href="/portal">
                <Button
                  size="lg"
                  className="text-white bg-black hover:bg-neutral-800 rounded-full 
                   px-12 py-2 text-md"
                >
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
          <footer className="relative w-screen overflow-hidden">
            {/* Greenline Banner */}

            {/* Footer Content */}
            <div className="bg-black text-white py-20">
              <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                  {/* Company Info */}
                  <div className="space-y-4">
                    <h3 className="text-[#D4FF00] text-lg font-semibold">About</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Empowering traders with AI-driven market insights and predictive analytics.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div className="space-y-4">
                    <h3 className="text-[#D4FF00] text-lg font-semibold">Quick Links</h3>
                    <ul className="space-y-2">
                      {['Home', 'Portal', 'Features', 'Pricing'].map((item) => (
                        <li key={item}>
                          <a href="#" className="text-gray-400 hover:text-[#D4FF00] transition-colors text-sm">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Resources */}
                  <div className="space-y-4">
                    <h3 className="text-[#D4FF00] text-lg font-semibold">Resources</h3>
                    <ul className="space-y-2">
                      {['Documentation', 'API', 'Support', 'Blog'].map((item) => (
                        <li key={item}>
                          <a href="#" className="text-gray-400 hover:text-[#D4FF00] transition-colors text-sm">
                            {item}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contact */}
                  <div className="space-y-4">
                    <h3 className="text-[#D4FF00] text-lg font-semibold">Contact</h3>
                    <ul className="space-y-2">
                      <li>
                        <a href="mailto:contact@greenline.ai" className="text-gray-400 hover:text-[#D4FF00] transition-colors text-sm">
                          contact@greenline.ai
                        </a>
                      </li>
                      <li className="flex space-x-4 pt-2">
                        {['Twitter', 'LinkedIn', 'GitHub'].map((platform) => (
                          <a
                            key={platform}
                            href="#"
                            className="text-gray-400 hover:text-[#D4FF00] transition-colors text-sm"
                          >
                            {platform}
                          </a>
                        ))}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
                  <p className="text-gray-400 text-sm">
                    © {new Date().getFullYear()} Greenline. All rights reserved.
                  </p>
                  <div className="flex space-x-6 mt-4 md:mt-0">
                    <a href="#" className="text-gray-400 hover:text-[#D4FF00] transition-colors text-sm">
                      Privacy Policy
                    </a>
                    <a href="#" className="text-gray-400 hover:text-[#D4FF00] transition-colors text-sm">
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </footer>
        </div>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4FF00]/20 to-transparent" />
    </div>
  );
};

export default HeroSection;