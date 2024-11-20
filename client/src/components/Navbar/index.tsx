"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CiSearch } from 'react-icons/ci';
import { FaArrowRight } from 'react-icons/fa';
import { Spinner } from '../ui/spinner';
import { IoClose } from 'react-icons/io5';

export default function Navbar() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleSelectResult = (result: any) => {
    router.push(`/quote/${result.ticker}`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
        const response = await fetch(
          `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(
            searchQuery
          )}&limit=20&apiKey=${apiKey}`
        );
        const data = await response.json();
        if (data.status !== 'OK') {
          throw new Error(data.error || 'Failed to fetch data');
        }
        setSearchResults(data.results);
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="w-full text-sm py-2 fixed top-0 bg-black z-50">
      <div className="w-full">
        <div className="flex items-center justify-between px-4 mx-auto space-x-4 max-w-[1440px]">

          {/* Left Section - Logo */}
          <div className="flex items-center">
            <button className="invert" onClick={() => router.push('/portal')}>
              <Image
                src="/greenline-logo-icon-transparent.png"
                width={40}
                height={40}
                alt="Greenline Logo"
              />
            </button>
          </div>

          {/* Center Section - Search Bar */}
          <div
            className="relative w-full max-w-xl"
            ref={searchRef}
          >
            <div className="flex items-center w-full space-x-2 group rounded-sm px-4 py-1.5 relative outline outline-[0.5px] transition-all duration-600 outline-neutral-700 focus-within:outline focus-within:outline-[#D4FF00]">
              <CiSearch size={20} className="text-gray-100" />
              <input
                type="search"
                placeholder="Search"
                className="border-none w-full bg-black outline-none text-xs text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <IoClose
                  className="text-gray-400 cursor-pointer"
                  onClick={() => setSearchQuery('')}
                />
              )}
              {isLoading && <Spinner size="small" className="ml-2" />}
            </div>
            {(isLoading || error || searchResults.length > 0) && (
              <div className="transition-opacity duration-300 ease-in-out scrollbar-thumb-rounded-full scrollbar-track-rounded-md scrollbar scrollbar-thumb-[#4c4c4c] scrollbar-track-[#1E2124] absolute left-0 right-0 bg-[#1E2124] text-white mt-1 border border-[#41494E] rounded-md max-h-60 overflow-y-auto z-10">
                {isLoading && <div className="p-4"><Spinner size="medium" /></div>}
                {error && <div className="p-4 text-red-500">Error: {error}</div>}
                {!isLoading && !error && searchResults.length === 0 && (
                  <div className="p-4 text-gray-500">No results found.</div>
                )}
                {!isLoading && !error && searchResults.length > 0 && (
                  <ul>
                    {searchResults.map((result) => (
                      <li
                        key={result.ticker}
                        className="px-4 py-1 hover:bg-[#30363A] text-sm cursor-pointer"
                        onClick={() => handleSelectResult(result)}
                      >
                        <div className="flex justify-between gap-6 px-4 py-1">
                          <span>{highlightMatch(result.ticker, searchQuery)}</span>
                          <span className='overflow-hidden truncate max-w-64'>{highlightMatch(result.name, searchQuery)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right Section - Watchlist, Account, and Avatar */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-[#D4FF00] text-black px-4 py-1 rounded-xl flex items-center space-x-2">
                <span className="font-semibold">Watchlist</span>
                <FaArrowRight className="-rotate-45" />
              </div>
              <div>
                <span>Account</span>
              </div>
            </div>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string) {
  const regex = new RegExp(`(${query})`, 'i');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    regex.test(part) ? <strong key={index} className="font-bold">{part}</strong> : part
  );
}
