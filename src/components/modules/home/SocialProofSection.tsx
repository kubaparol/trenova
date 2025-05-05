"use client";

import React, { useEffect, useRef, useState } from "react";
import { Star, User } from "lucide-react";

interface TestimonialCardProps {
  name: string;
  quote: string;
  achievement: string;
  rating: number;
  delay: number;
  isVisible: boolean;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({
  name,
  quote,
  achievement,
  rating,
  delay,
  isVisible,
}) => {
  return (
    <div
      className={`bg-card/60 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-primary/30 h-full p-6 transition-all duration-700 transform ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
      } hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary/70 flex items-center justify-center">
            <User size={24} className="text-accent" />
          </div>
          <div className="ml-3">
            <h4 className="text-foreground font-semibold">{name}</h4>
            <div className="text-xs text-primary">{achievement}</div>
          </div>
        </div>
        <div className="flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={16}
              className={
                i < rating
                  ? "text-accent fill-primary"
                  : "text-accent fill-accent"
              }
            />
          ))}
        </div>
      </div>
      <p className="text-muted-foreground">&ldquo;{quote}&rdquo;</p>
    </div>
  );
};

const SocialProofSection: React.FC = () => {
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

  const testimonials = [
    {
      name: "Alex Johnson",
      quote:
        "After trying countless workout apps, Trenova is the only one that actually understood my goals. The personalized plans keep me challenged without overwhelming me.",
      achievement: "14 weeks consistent training",
      rating: 5,
    },
    {
      name: "Sarah Williams",
      quote:
        "As a busy professional, I never thought I'd find time for fitness. Trenova created a 30-minute routine that fits perfectly in my schedule and has transformed my energy levels.",
      achievement: "Lost 24 lbs in 3 months",
      rating: 5,
    },
    {
      name: "Michael Chen",
      quote:
        "The workout adaptability is incredible. When I travel and don't have gym access, Trenova instantly adjusts my plan for bodyweight exercises that maintain my progress.",
      achievement: "Increased strength by 65%",
      rating: 4,
    },
    {
      name: "Jamie Rodriguez",
      quote:
        "After my knee injury, I thought my fitness journey was over. Trenova created safe workouts that helped me rebuild strength while respecting my limitations.",
      achievement: "Fully recovered from injury",
      rating: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="relative py-20 bg-gradient-to-b from-background to-background/90"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Join the Fitness Revolution
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            See how Trenova is transforming workout experiences for people just
            like you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              name={testimonial.name}
              quote={testimonial.quote}
              achievement={testimonial.achievement}
              rating={testimonial.rating}
              delay={index * 150}
              isVisible={isVisible}
            />
          ))}
        </div>

        <div
          className={`mt-16 text-center transition-all duration-700 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-sm text-muted-foreground">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className="text-accent fill-primary" />
              ))}
            </span>

            <span className="font-medium">
              4.9 average rating from over 10,000 users
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
