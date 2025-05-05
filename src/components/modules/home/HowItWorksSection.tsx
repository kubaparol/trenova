"use client";

import React, {
  useEffect,
  useRef,
  useState,
  isValidElement,
  cloneElement,
} from "react";
import { MessageSquare, Lightbulb, BarChart2 } from "lucide-react";

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isVisible: boolean;
}

const Step: React.FC<StepProps> = ({
  number,
  title,
  description,
  icon,
  isVisible,
}) => {
  let iconWithClass: React.ReactNode = icon;
  if (isValidElement(icon)) {
    // Clone the element and add the className prop
    iconWithClass = cloneElement(
      icon as React.ReactElement<React.HTMLAttributes<SVGElement>>,
      { className: "text-primary-foreground" }
    );
  }

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      }`}
      style={{ transitionDelay: `${number * 200}ms` }}
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/70 to-primary flex items-center justify-center mb-6 shadow-lg">
        {iconWithClass}
      </div>

      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-xs">
        {description}
      </p>

      {number < 3 && (
        <div className="hidden md:block absolute top-10 left-full w-16 border-t-2 border-dashed border-primary/50 transform -translate-x-8"></div>
      )}
    </div>
  );
};

const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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

  const steps = [
    {
      number: 1,
      title: "Tell Us Your Goals",
      description:
        "Answer a few questions about your experience, goals, and available equipment",
      icon: <MessageSquare size={32} />,
    },
    {
      number: 2,
      title: "AI Creates Your Plan",
      description:
        "Our AI analyzes thousands of effective workout combinations to build your optimal plan",
      icon: <Lightbulb size={32} />,
    },
    {
      number: 3,
      title: "Track Your Progress",
      description:
        "Complete workouts, track your progress, and see your fitness journey visualized",
      icon: <BarChart2 size={32} />,
    },
  ];

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-background to-background/90"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Three Steps to Your Perfect Workout Plan
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6">
          {steps.map((step) => (
            <Step
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 100"
          className="w-full h-auto fill-primary/80"
        >
          <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HowItWorksSection;
