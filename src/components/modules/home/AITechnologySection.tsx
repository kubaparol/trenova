"use client";

import React, {
  useEffect,
  useRef,
  useState,
  isValidElement,
  cloneElement,
  HTMLAttributes,
} from "react";
import {
  BrainCircuit,
  Clock,
  Weight,
  Activity,
  BarChart2,
  Database,
} from "lucide-react";

interface NodeProps {
  x: number;
  y: number;
  label: string;
  icon: React.ReactNode;
  delay?: number;
  isVisible: boolean;
  isActive: boolean;
  onClick: () => void;
}

const Node: React.FC<NodeProps> = ({
  x,
  y,
  label,
  icon,
  delay = 0,
  isVisible,
  isActive,
  onClick,
}) => {
  let iconWithClass: React.ReactNode = icon;
  if (isValidElement(icon)) {
    iconWithClass = cloneElement(
      icon as React.ReactElement<HTMLAttributes<SVGElement>>,
      {
        className: isActive ? "text-primary-foreground" : "text-primary",
      }
    );
  }

  return (
    <div
      className={`absolute transition-all duration-500 transform cursor-pointer ${
        isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
      }`}
      style={{
        left: `${x}%`,
        top: `${y + 5}%`,
        transitionDelay: `${delay}ms`,
        zIndex: isActive ? 20 : 10,
      }}
      onClick={onClick}
    >
      <div className="absolute -translate-x-1/2 -translate-y-1/2">
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
            isActive
              ? "bg-primary scale-110 shadow-lg shadow-primary/30"
              : "bg-card/80 border border-primary/30 hover:bg-card"
          }`}
        >
          {iconWithClass}
        </div>
        <div
          className={`text-xs text-center font-medium transition-all duration-300 ${
            isActive ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {label}
        </div>

        {isActive && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-48 bg-card/95 backdrop-blur-sm rounded-lg shadow-xl border border-primary/30 p-3 z-30">
            <h4 className="text-foreground font-semibold mb-2">{label}</h4>
            <p className="text-muted-foreground text-xs">
              Our AI analyzes this factor to create a personalized workout plan
              that perfectly matches your specific needs and goals.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AITechnologySection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeNode, setActiveNode] = useState<number | null>(null);

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

  const nodes = [
    { x: 30, y: 20, label: "Time Available", icon: <Clock /> },
    { x: 20, y: 60, label: "Fitness Level", icon: <Activity /> },
    { x: 50, y: 77, label: "Equipment", icon: <Weight /> },
    { x: 80, y: 60, label: "Goals", icon: <BarChart2 /> },
    { x: 70, y: 20, label: "Health History", icon: <Database /> },
  ];

  const benefits = [
    "Analyzes thousands of exercise combinations",
    "Adapts to your feedback and progress",
    "Considers scientific principles of effective training",
    "Balances workout variety with proven exercise patterns",
  ];

  const handleNodeClick = (index: number) => {
    setActiveNode(activeNode === index ? null : index);
  };

  return (
    <section
      id="technology"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-background to-background/90"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Smart Technology, Simple Experience
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Behind the scenes, our advanced AI works tirelessly to create your
            perfect workout plan
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-12">
          {/* Left side - Visual representation of AI decision process */}
          <div className="w-full lg:w-1/2">
            <div className="relative bg-card/40 backdrop-blur-sm rounded-xl shadow-xl border border-primary/30 h-80">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div
                  className={`w-20 h-20 rounded-full bg-primary flex items-center justify-center transition-all duration-500 ${
                    isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
                  }`}
                >
                  <BrainCircuit size={32} className="text-primary-foreground" />
                </div>
              </div>

              {/* Connection lines to the center */}
              <svg
                className="absolute inset-0 w-full h-full"
                xmlns="http://www.w3.org/2000/svg"
                style={{ zIndex: 5 }}
              >
                <defs>
                  <linearGradient
                    id="lineGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop
                      offset="0%"
                      style={{
                        stopColor: "var(--color-primary)",
                        stopOpacity: 0.3,
                      }}
                    />
                    <stop
                      offset="100%"
                      style={{
                        stopColor: "var(--color-primary)",
                        stopOpacity: 0.8,
                      }}
                    />
                  </linearGradient>
                </defs>
                {nodes.map((node, index) => (
                  <line
                    key={index}
                    x1="50%"
                    y1="50%"
                    x2={`${node.x}%`}
                    y2={`${node.y}%`}
                    stroke={
                      activeNode === index
                        ? "url(#lineGradient)"
                        : "var(--color-primary)"
                    }
                    strokeWidth={activeNode === index ? "2" : "1.5"}
                    strokeDasharray={activeNode === index ? "none" : "4,4"}
                    className={`transition-all duration-500 ${
                      isVisible ? "opacity-60" : "opacity-0"
                    } ${
                      activeNode !== index && activeNode !== null
                        ? "opacity-30"
                        : ""
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`,
                      strokeLinecap: "round",
                    }}
                  />
                ))}
              </svg>

              {/* Nodes that represent inputs */}
              {nodes.map((node, index) => (
                <Node
                  key={index}
                  x={node.x}
                  y={node.y}
                  label={node.label}
                  icon={node.icon}
                  delay={index * 100}
                  isVisible={isVisible}
                  isActive={activeNode === index}
                  onClick={() => handleNodeClick(index)}
                />
              ))}
            </div>
          </div>

          {/* Right side - Key technology benefits */}
          <div className="w-full lg:w-1/2">
            <div className="bg-card/40 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-primary/30 h-full">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-6">
                  How Our AI Works For You
                </h3>

                <div className="space-y-6">
                  {benefits.map((benefit, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 transition-all duration-500 transform ${
                        isVisible
                          ? "translate-x-0 opacity-100"
                          : "translate-x-10 opacity-0"
                      }`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex-shrink-0 flex items-center justify-center mt-1">
                        <span className="text-primary-foreground text-xs font-bold">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="text-foreground font-medium">{benefit}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-10 bg-primary/10 rounded-lg p-4 transition-all duration-500 transform ${
                    isVisible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-10 opacity-0"
                  }`}
                  style={{ transitionDelay: "600ms" }}
                >
                  <p className="text-muted-foreground text-sm">
                    &quot;Our deep learning models have been trained on
                    thousands of successful workout plans created by
                    professional trainers. This allows us to recommend the most
                    effective exercise combinations for your specific
                    profile.&quot;
                  </p>
                  <p className="text-foreground text-sm font-medium mt-2">
                    — Trenova AI Research Team
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITechnologySection;
