"use client";

import { Home } from "lucide-react";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import Link from "next/link";
import { ProjectUrls } from "@/constants/urls";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/90 flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
        <div
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/10 rounded-full filter blur-3xl animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="relative text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Dumbbell className="h-16 w-16 text-primary" />
        </div>

        {/* Error code */}
        <h1 className="text-9xl font-bold text-foreground mb-4">404</h1>

        {/* Message */}
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          Looks like you&apos;ve wandered off the workout path. Don&apos;t
          worry, even the best athletes take wrong turns sometimes.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="default"
            size="lg"
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={20} />
            Go Back
          </Button>

          <Button
            asChild
            variant="ghost"
            size="lg"
            className="flex items-center gap-2"
          >
            <Link href={ProjectUrls.home}>
              <Home size={20} />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
