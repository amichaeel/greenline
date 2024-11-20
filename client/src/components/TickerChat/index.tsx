"use client";

import React, { useState, useRef, useEffect } from "react";
import OpenAI from "openai";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { ArrowBigUp, MessageCircle, ChevronDown } from "lucide-react";
import Image from "next/image";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface TickerChatProps {
  ticker: string;
}

const TickerChat: React.FC<TickerChatProps> = ({ ticker }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content: `You are the stock ticker ${ticker}. You will respond as if you are the ticker itself, providing insights, information, and relevant advice for those that wants to learn about ${ticker} and potentially purchase some shares. Keep responses to the point while still being useful. Respond in paragraph format.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState("");

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      sendMessage();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setStreamingContent("");

    try {
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        dangerouslyAllowBrowser: true
      });

      const stream = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [...messages, userMessage],
        max_tokens: 16384,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullContent += content;
        setStreamingContent(fullContent);
      }

      const botMessage: Message = {
        role: "assistant",
        content: fullContent
      };

      setMessages(prev => [...prev, botMessage]);
      setStreamingContent("");
    } catch (error) {
      console.error("Error communicating with OpenAI API:", error);
    } finally {
      setLoading(false);
    }
  };

  const messageCount = messages.filter(msg => msg.role !== "system").length;

  return (
    <Card className="w-full bg-black border-none shadow-xl px-0 overflow-hidden">
      <Accordion type="single" collapsible className="px-0">
        <AccordionItem value="chat" className="border-none">
          <AccordionTrigger className=" py-3 hover:no-underline">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-5 w-5 text-[#D4FF00]" />
                <span className="font-semibold text-white">Chat with ${ticker}</span>
              </div>
              <div className="flex items-center gap-3 px-4">
                {messageCount > 0 && (
                  <span className="text-sm text-gray-400">
                    {messageCount} message{messageCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div className="px-1 space-y-4 bg-zinc-900 rounded-xl p-4">
              <div className="h-[400px] overflow-y-auto scrollbar scrollbar-track-black scrollbar-thumb-[#D4FF00]">
                <div className="space-y-4 p-4">
                  {messages
                    .filter((msg) => msg.role !== "system")
                    .map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user"
                            ? "bg-[#D4FF00] text-black"
                            : "bg-zinc-800 text-zinc-100"
                            }`}
                        >
                          <p className="break-words">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  {streamingContent && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-zinc-800 text-zinc-100">
                        <p className="break-words">{streamingContent}</p>
                      </div>
                    </div>
                  )}
                  {loading && !streamingContent && (
                    <div className="flex justify-center">
                      <Image
                        src="/greenline-logo-icon-transparent.png"
                        width={40}
                        height={40}
                        alt="Loading"
                        className="animate-pulse invert"
                      />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="flex m-4 rounded-full p-1 outline outline-[0.5px] transition-all duration-600 outline-neutral-700 focus-within:outline focus-within:outline-[#D4FF00]">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="flex-1 bg-white/0 px-4 outline-none text-white"
                  placeholder={`Message $${ticker}`}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  variant={"destructive"}
                  size={"icon"}
                  className="bg-[#D4FF00] hover:bg-[#D4FF0090] rounded-full text-black px-4 py-2 transition-colors disabled:opacity-50 disabled:bg-zinc-700 disabled:cursor-not-allowed"
                >
                  <ArrowBigUp />
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default TickerChat;