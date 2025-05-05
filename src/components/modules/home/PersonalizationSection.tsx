"use client";

import React, {
  useEffect,
  useRef,
  useState,
  isValidElement,
  cloneElement,
  HTMLAttributes,
} from "react";
import { Target, Dumbbell, User, Clock, Heart, TrendingUp } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: number;
  isVisible: boolean;
  onClick: () => void;
  isActive: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  delay,
  isVisible,
  onClick,
  isActive,
}) => {
  let iconWithClass: React.ReactNode = icon;
  if (isValidElement(icon)) {
    iconWithClass = cloneElement(
      icon as React.ReactElement<HTMLAttributes<SVGElement>>,
      {
        className: "text-primary",
      }
    );
  }

  return (
    <div
      className={`relative cursor-pointer transform transition-all duration-500 h-fit ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
      } ${isActive ? "scale-105 z-10" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
      onClick={onClick}
    >
      <div
        className={`h-full rounded-xl overflow-hidden shadow-lg backdrop-blur-sm border border-primary/30 transition-all duration-300 ${
          isActive
            ? "bg-gradient-to-br from-primary/90 to-primary/80"
            : "bg-card/60 hover:bg-card/80"
        }`}
      >
        <div className="p-6">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
              isActive ? "bg-card/60" : "bg-background/60"
            }`}
          >
            {iconWithClass}
          </div>

          <h3
            className={`text-xl font-bold  ${
              isActive ? "text-primary-foreground" : "text-foreground"
            } mb-2`}
          >
            {title}
          </h3>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              isActive ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <p className="text-accent mt-3">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PersonalizationSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(0);

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

  const features = [
    {
      title: "Goal-Focused Planning",
      description:
        "Whether you're aiming for strength, weight loss, endurance, or muscle gain, our AI tailors your workout plan specifically to your primary fitness goal. Each exercise, rep scheme, and progression is designed to get you to your desired outcome as efficiently as possible.",
      icon: <Target size={24} />,
    },
    {
      title: "Equipment Adaptability",
      description:
        "No gym membership? No problem. Working out of a hotel room? We've got you covered. Trenova creates effective workouts based on whatever equipment you have available—from fully equipped gyms to bodyweight-only routines that require no equipment at all.",
      icon: <Dumbbell size={24} />,
    },
    {
      title: "Experience Consideration",
      description:
        "Whether you're just starting your fitness journey or you're an experienced athlete, your workout plan adjusts to your fitness level. Beginners receive proper form guidance and manageable progressions, while advanced users get the challenging routines they need.",
      icon: <User size={24} />,
    },
    {
      title: "Time-Optimized",
      description:
        "Your time is valuable. Tell us how much time you can commit, and we'll create efficient workouts that deliver maximum results within your schedule constraints. From quick 20-minute sessions to comprehensive 90-minute workouts, we optimize every minute.",
      icon: <Clock size={24} />,
    },
    {
      title: "Health-Conscious",
      description:
        "Working around an injury or medical condition? Our AI takes your health concerns into account, avoiding exercises that might exacerbate issues while suggesting alternatives that can help with rehabilitation and overall fitness progression.",
      icon: <Heart size={24} />,
    },
    {
      title: "Progressive Development",
      description:
        "As you grow stronger, your workouts should too. Trenova automatically adjusts your plan based on your progress, increasing intensity and complexity at the right pace to keep you challenged without risking injury or burnout.",
      icon: <TrendingUp size={24} />,
    },
  ];

  const handleCardClick = (index: number) => {
    setActiveCard(activeCard === index ? null : index);
  };

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-primary/80 to-primary/90"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Personalized to Your Unique Needs
          </h2>
          <p className="text-accent max-w-2xl mx-auto">
            No two fitness journeys are alike.
            <br />
            Our AI creates a workout experience as individual as you are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              delay={index * 100}
              isVisible={isVisible}
              onClick={() => handleCardClick(index)}
              isActive={activeCard === index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonalizationSection;
