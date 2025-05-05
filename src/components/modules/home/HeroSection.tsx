"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/animations/ParticleBackground";
import WorkoutPlanVisualization from "@/components/animations/WorkoutPlanVisualization";
import Link from "next/link";
import { ProjectUrls } from "@/constants/urls";
import { ArrowRight } from "lucide-react";

const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = 0;
    let mouseY = 0;
    let visualizationElement: HTMLElement | null = null;

    setTimeout(() => {
      visualizationElement = container.querySelector(
        ".visualization"
      ) as HTMLElement;
    }, 100);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width - 0.5;
      mouseY = (e.clientY - rect.top) / rect.height - 0.5;

      if (visualizationElement) {
        visualizationElement.style.transform = `perspective(1000px) rotateY(${
          mouseX * 5
        }deg) rotateX(${-mouseY * 5}deg)`;
      }
    };

    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center pb-12"
    >
      <ParticleBackground />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Your AI Fitness Coach,{" "}
              <span className="text-primary">Personalized for You</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Get a professional workout plan tailored to your goals, equipment,
              and schedule in seconds
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Button asChild variant="default" size="lg" className="group">
                <Link href={ProjectUrls.createTrainingPlan}>
                  Create Your Plan
                  <ArrowRight
                    size={16}
                    className="group-hover:ml-2 transition-all duration-300"
                  />
                </Link>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href={ProjectUrls.signIn}>Sign In</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - 3D Visualization */}
          <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
            <div className="visualization w-full max-w-md transition-transform duration-300 ease-out">
              <WorkoutPlanVisualization />
            </div>
          </div>
        </div>
      </div>

      {/* Hero Bottom Gradient */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default HeroSection;
