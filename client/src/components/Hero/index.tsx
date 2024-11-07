import { ArrowRight, ChartLine, BookOpen, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const HeroSection = () => {
  return (
    <div className="relative min-h-fit h-screen mt-16 overflow-hidden">
      {/* Background gradient and pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-black to-transparent" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Main content */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-20">
          {/* Highlight bar */}
          <div className="mb-8">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4FF00]/10 border border-[#D4FF00]/20">
              <span className="text-[#D4FF00] text-sm font-medium">New Feature</span>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#D4FF00] text-black">
                AI Market Analysis
              </span>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#D4FF00] to-green-400">
            Financial Literacy,
            <br />
            Made Easy
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-400 text-center max-w-3xl mb-12">
            Master the markets with real-time insights, educational resources, and AI-powered analysis
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Button size="lg" className="bg-[#D4FF00] text-black hover:bg-[#D4FF00]/90 font-semibold">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-[#D4FF00] text-[#D4FF00] hover:bg-[#D4FF00]/10">
              Watch Demo
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            <Card className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <ChartLine className="h-12 w-12 text-[#D4FF00] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Real-Time Analytics</h3>
              <p className="text-gray-400">Track market movements and make informed decisions with live data</p>
            </Card>

            <Card className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <BookOpen className="h-12 w-12 text-[#D4FF00] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Learn & Grow</h3>
              <p className="text-gray-400">Access comprehensive educational resources and market insights</p>
            </Card>

            <Card className="p-6 bg-gray-900/50 border-gray-800 backdrop-blur-sm">
              <TrendingUp className="h-12 w-12 text-[#D4FF00] mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">AI Insights</h3>
              <p className="text-gray-400">Get AI-powered market analysis and trading recommendations</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4FF00]/50 to-transparent" />
      <div className="absolute -bottom-48 -left-48 w-96 h-96 bg-[#D4FF00]/30 rounded-full filter blur-[128px]" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-[#D4FF00]/20 rounded-full filter blur-[128px]" />
    </div>
  );
};

export default HeroSection;