"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CiSearch } from 'react-icons/ci';
import { FaArrowRight } from 'react-icons/fa';
import { Spinner } from '../ui/spinner';
import { IoClose } from 'react-icons/io5';

export default function NavbarHome() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);


  return (
    <div className="w-full flex items-center bg-black text-sm h-16 fixed top-0 border-b text-black z-50">
      <div className="w-full">
        <div className="flex items-center justify-between px-4 mx-auto space-x-4 max-w-[1440px]">

          {/* Left Section - Logo */}
          <div className="flex items-center">
            <button className="invert" onClick={() => router.push('/')}>
              <Image
                src="/greenline-logo-icon-transparent.png"
                width={40}
                height={40}
                alt="Greenline Logo"
              />
            </button>
          </div>

          {/* Right Section - Watchlist, Account, and Avatar */}
          <div className="flex items-center space-x-4">
            <div className='md:flex hidden items-center justify-center rounded-full outline-white cursor-pointer hover:outline-white/40 hover:text-white/60 text-white outline outline-[1px] p-3 w-28'>
              <span>Log In</span>
            </div>
            <div className='flex items-center justify-center rounded-full cursor-pointer bg-neutral-300 hover:bg-neutral-400 outline outline-[1px] p-3 w-28'>
              <span>Sign Up</span>
            </div>
            {/* <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar> */}
          </div>
        </div>
      </div>
    </div>
  );
}
