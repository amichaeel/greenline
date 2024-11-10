"use client";

import React, { useState, useEffect } from "react";
import NavbarHome from "@/components/NavbarHome";
import { Spinner } from "@/components/ui/spinner";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { BsFillCloudArrowUpFill, BsFillCloudArrowDownFill } from "react-icons/bs";
import HeroSection from "@/components/Hero";

export default function Home() {
  const [error, setError] = useState<string | null>(null);


  return (
    <div className="text-white">
      <NavbarHome />
      <HeroSection />
    </div>
  );
}