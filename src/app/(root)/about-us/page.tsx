import React, { isValidElement, cloneElement, HTMLAttributes } from "react";
import { Users, Target, Code2, Heart } from "lucide-react";

export default function AboutUs() {
  const team = [
    {
      name: "Sarah Chen",
      role: "CEO & Co-founder",
      image:
        "https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Former professional athlete and AI researcher",
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO & Co-founder",
      image:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Machine learning expert with 15 years experience",
    },
    {
      name: "Emily Taylor",
      role: "Head of Fitness",
      image:
        "https://images.pexels.com/photos/3765114/pexels-photo-3765114.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Certified trainer and nutrition specialist",
    },
    {
      name: "David Park",
      role: "Lead Developer",
      image:
        "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300",
      bio: "Full-stack developer and fitness enthusiast",
    },
  ];

  const values = [
    {
      icon: <Users className="h-6 w-6" />,
      title: "User-Focused",
      description: "Every feature we build starts with our users' needs",
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Results-Driven",
      description: "We measure success by our users' fitness achievements",
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Innovation",
      description: "Constantly pushing the boundaries of AI fitness technology",
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Wellness",
      description: "Promoting holistic health and sustainable fitness habits",
    },
  ];

  return (
    <div className="space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
          About Us
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground">
          Building the future of personalized fitness
        </p>
      </header>
      <div className="space-y-12">
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Our Story
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            Founded in 2025, Trenova emerged from a simple observation:
            traditional workout plans don&apos;t adapt to individual needs. Our
            founders, combining expertise in AI and fitness, set out to create a
            truly personalized fitness experience that evolves with each
            user&apos;s journey.
          </p>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              let iconWithClass: React.ReactNode = value.icon;
              if (isValidElement(value.icon)) {
                iconWithClass = cloneElement(
                  value.icon as React.ReactElement<HTMLAttributes<SVGElement>>,
                  {
                    className: "h-6 w-6 text-primary",
                  }
                );
              }
              return (
                <div key={index} className="bg-card/50 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    {iconWithClass}
                    <h3 className="text-foreground font-semibold ml-3">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            Our Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div
                key={index}
                className="bg-card/50 rounded-lg overflow-hidden"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <h3 className="text-foreground font-semibold">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm mb-2">{member.role}</p>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Our Mission
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            We&apos;re on a mission to democratize access to
            professional-quality fitness guidance. By combining cutting-edge AI
            technology with proven exercise science, we&apos;re making
            personalized workout plans accessible to everyone, regardless of
            their experience level or circumstances.
          </p>
        </section>
      </div>
    </div>
  );
}
