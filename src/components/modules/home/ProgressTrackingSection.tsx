"use client";

import React, { useEffect, useRef, useState } from "react";
import { Calendar, BarChart, Award, Clock } from "lucide-react";

interface TrackingToolProps {
  title: string;
  active: boolean;
  children: React.ReactNode;
}

const TrackingTool: React.FC<TrackingToolProps> = ({
  title,
  active,
  children,
}) => {
  return (
    <div
      className={`min-w-full md:min-w-[500px] lg:min-w-[600px] transition-all duration-300 transform ${
        active ? "scale-100 opacity-100" : "scale-95 opacity-50"
      }`}
    >
      <div className="bg-card/90 backdrop-blur-sm border border-primary/30 rounded-xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-gradient-to-r from-primary/80 to-primary/70 border-b border-primary/50">
          <h3 className="text-primary-foreground font-semibold">{title}</h3>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const CalendarVisualization: React.FC = () => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const completedDays = [1, 3, 5, 8, 10, 12, 15, 17, 19, 22, 24, 26, 29];

  return (
    <div className="mb-4">
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
          <div
            key={i}
            className="text-center text-muted-foreground text-sm font-medium"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <div
            key={day}
            className={`h-10 flex items-center justify-center rounded-lg text-sm font-medium ${
              completedDays.includes(day)
                ? "bg-primary text-primary-foreground"
                : day < 31
                ? "bg-card/60 text-muted-foreground"
                : "bg-transparent text-muted-foreground/50"
            }`}
          >
            {day <= 31 ? day : ""}
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="text-muted-foreground text-sm">
          <span className="text-foreground font-semibold">13</span> workouts
          completed
        </div>
        <div className="text-muted-foreground text-sm">
          <span className="text-foreground font-semibold">87%</span> completion
          rate
        </div>
      </div>
    </div>
  );
};

const ProgressBarVisualization: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground text-sm">
            Strength Progress
          </span>
          <span className="text-foreground font-medium text-sm">78%</span>
        </div>
        <div className="w-full bg-card/70 rounded-full h-3">
          <div
            className="bg-primary h-3 rounded-full"
            style={{ width: "78%" }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground text-sm">Cardio Fitness</span>
          <span className="text-foreground font-medium text-sm">65%</span>
        </div>
        <div className="w-full bg-card/70 rounded-full h-3">
          <div
            className="bg-accent h-3 rounded-full"
            style={{ width: "65%" }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground text-sm">Flexibility</span>
          <span className="text-foreground font-medium text-sm">42%</span>
        </div>
        <div className="w-full bg-card/70 rounded-full h-3">
          <div
            className="bg-secondary h-3 rounded-full"
            style={{ width: "42%" }}
          ></div>
        </div>
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <span className="text-muted-foreground text-sm">Overall Goal</span>
          <span className="text-foreground font-medium text-sm">62%</span>
        </div>
        <div className="w-full bg-card/70 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary to-accent h-3 rounded-full"
            style={{ width: "62%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ConsistencyVisualization: React.FC = () => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <div className="w-40 h-40 rounded-full border-8 border-primary/30 flex items-center justify-center">
          <div className="text-4xl font-bold text-foreground">92%</div>
        </div>
        <svg
          className="absolute top-0 left-0"
          width="160"
          height="160"
          viewBox="0 0 160 160"
        >
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="var(--color-primary)"
            strokeOpacity="0.1"
            strokeWidth="8"
          />
          <circle
            cx="80"
            cy="80"
            r="70"
            fill="none"
            stroke="var(--color-primary)"
            strokeWidth="8"
            strokeDasharray="439.8"
            strokeDashoffset={439.8 * (1 - 0.92)}
            transform="rotate(-90 80 80)"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="grid grid-cols-4 gap-6 w-full">
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">24</div>
          <div className="text-xs text-muted-foreground">Days Active</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">4</div>
          <div className="text-xs text-muted-foreground">Streak Weeks</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">2</div>
          <div className="text-xs text-muted-foreground">Rest Days</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-foreground">A+</div>
          <div className="text-xs text-muted-foreground">Rating</div>
        </div>
      </div>
    </div>
  );
};

const TrainingTimeVisualization: React.FC = () => {
  const weekData = [
    { day: "Mon", minutes: 45, intensity: "high" },
    { day: "Tue", minutes: 60, intensity: "medium" },
    { day: "Wed", minutes: 30, intensity: "low" },
    { day: "Thu", minutes: 50, intensity: "medium" },
    { day: "Fri", minutes: 75, intensity: "high" },
    { day: "Sat", minutes: 40, intensity: "low" },
    { day: "Sun", minutes: 0, intensity: "rest" },
  ];

  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 30); // Ensure minimum height, e.g., 30 mins
  const yAxisLabels = [0, Math.round(maxMinutes / 2), maxMinutes];

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case "high":
        return "bg-primary";
      case "medium":
        return "bg-primary/70";
      case "low":
        return "bg-primary/40";
      default:
        return "bg-card/50";
    }
  };

  return (
    <div className="p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-4 text-center">
        Weekly Training Time (minutes)
      </h4>
      <div className="flex">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between h-48 text-xs text-muted-foreground pr-2 text-right w-8">
          <span>{yAxisLabels[2]}</span>
          <span>{yAxisLabels[1]}</span>
          <span>{yAxisLabels[0]}</span>
        </div>

        {/* Chart Bars */}
        <div className="grid grid-cols-7 gap-3 h-48 items-end mb-4 flex-1">
          {weekData.map((data, index) => (
            <div key={index} className="relative group h-full flex items-end">
              <div
                className={`w-full rounded-t-sm transition-all duration-300 ${getIntensityColor(
                  data.intensity
                )}`}
                style={{
                  height: `${
                    data.minutes > 0 ? (data.minutes / maxMinutes) * 100 : 0
                  }%`,
                }}
              >
                <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-muted-foreground text-center">
                  {data.day}
                </div>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-card text-foreground px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {data.minutes > 0 ? `${data.minutes} min` : "Rest"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend and Totals */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground">
            <span className="text-foreground font-semibold">5h 00m</span> total
            this week
          </div>
          <div className="text-muted-foreground">
            <span className="text-foreground font-semibold">25%</span> increase
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary/70 rounded-full mr-2"></div>
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary/40 rounded-full mr-2"></div>
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressTrackingSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeToolIndex, setActiveToolIndex] = useState(0);

  const tools = [
    {
      title: "Completed Workouts Calendar",
      icon: <Calendar size={20} />,
      component: <CalendarVisualization />,
    },
    {
      title: "Weekly Progress Bar",
      icon: <BarChart size={20} />,
      component: <ProgressBarVisualization />,
    },
    {
      title: "Training Time Analytics",
      icon: <Clock size={20} />,
      component: <TrainingTimeVisualization />,
    },
    {
      title: "Consistency Rating",
      icon: <Award size={20} />,
      component: <ConsistencyVisualization />,
    },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 }
    );

    const currentRef = sectionRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-background/90 to-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Watch Your Progress Unfold
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Visualize your journey with intuitive tracking tools
          </p>
        </div>

        {/* Tool navigation */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-card/70 backdrop-blur-sm rounded-full p-1 border border-primary/20">
            {tools.map((tool, index) => (
              <button
                key={index}
                onClick={() => setActiveToolIndex(index)}
                className={`flex items-center px-4 py-2 rounded-full transition-all ${
                  activeToolIndex === index
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="mr-2">{tool.icon}</span>
                <span className="hidden md:inline text-sm font-medium">
                  {tool.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tool visualization */}
        <div className="relative overflow-hidden mx-auto max-w-4xl">
          <div className="flex">
            {tools.map((tool, index) => (
              <div
                key={index}
                className={`w-full flex-shrink-0 px-3 transition-transform duration-300 ${
                  index === activeToolIndex
                    ? "translate-x-0"
                    : "translate-x-full"
                }`}
                style={{
                  transform: `translateX(${-100 * activeToolIndex}%)`,
                }}
              >
                <TrackingTool
                  title={tool.title}
                  active={activeToolIndex === index}
                >
                  {tool.component}
                </TrackingTool>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProgressTrackingSection;
