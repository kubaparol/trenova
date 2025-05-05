"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { ProjectUrls } from "@/constants/urls";

const FinalCTASection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!backgroundRef.current || !sectionRef.current) return;

      const { left, top, width, height } =
        sectionRef.current.getBoundingClientRect();
      const x = (e.clientX - left) / width - 0.5;
      const y = (e.clientY - top) / height - 0.5;

      // Apply parallax effect to background
      backgroundRef.current.style.transform = `perspective(1000px) rotateY(${
        x * 5
      }deg) rotateX(${-y * 5}deg)`;
    };

    const currentRef = sectionRef.current;

    if (currentRef) {
      currentRef.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 bg-gradient-to-br from-background to-background/90 overflow-hidden"
    >
      {/* Background elements */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 transition-transform duration-300 ease-out"
      >
        <div className="absolute top-1/6 left-1/5 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/12 right-1/4 w-80 h-80 bg-accent/30 rounded-full filter blur-3xl"></div>
      </div>

      {/* Floating exercise icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/5 text-primary/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M4,18H20V20H4ZM4,14H20V16H4ZM8,4V12H16V4ZM10,6H14V10H10Z" />
          </svg>
        </div>
        <div
          className="absolute top-2/4 right-1/4 text-primary/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{ animationDelay: "1s" }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12,5A1,1,0,1,0,11,4,1,1,0,0,0,12,5ZM22,11H19.93A8,8,0,0,0,12.57,4.54a3,3,0,1,1-1.14,0A8,8,0,0,0,4.07,11H2a1,1,0,0,0-1,1v4a1,1,0,0,0,1,1H3a5.06,5.06,0,0,0,4,4.9V23h2V22h6v1h2V21.9a5.06,5.06,0,0,0,4-4.9h1a1,1,0,0,0,1-1V12A1,1,0,0,0,22,11ZM19,16a3,3,0,0,1-3,3H8a3,3,0,0,1-3-3V13h3v1.5a1,1,0,0,0,2,0V13h4v1.5a1,1,0,0,0,2,0V13h3Z" />
          </svg>
        </div>
        <div
          className="absolute bottom-1/4 left-1/3 text-primary/20 animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite]"
          style={{ animationDelay: "2s" }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21,11H16.5V8.5a2.5,2.5,0,0,1,5,0ZM20,4H17V2H15V4H9V2H7V4H4A2,2,0,0,0,2,6V20a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V6A2,2,0,0,0,20,4Zm0,16H4V10H20ZM7.5,17.5A2.5,2.5,0,1,0,5,15,2.5,2.5,0,0,0,7.5,17.5ZM16.5,15A2.5,2.5,0,1,0,14,12.5,2.5,2.5,0,0,0,16.5,15Z" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-6">
            Start Your Personalized Fitness Journey Today
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Your perfect workout plan is just seconds away
          </p>

          <Button asChild variant="default" size="lg" className="mb-8 group">
            <Link href={ProjectUrls.createTrainingPlan}>
              Create Your Free Plan
              <ArrowRight
                size={16}
                className="group-hover:ml-2 transition-all duration-300"
              />
            </Link>
          </Button>

          <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-muted-foreground gap-4 sm:gap-8">
            <div className="flex items-center">
              <CheckCircle className="mr-2 text-primary" size={16} />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 text-primary" size={16} />
              <span>100% personalized</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="mr-2 text-primary" size={16} />
              <span>Get started in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
