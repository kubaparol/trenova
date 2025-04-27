import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectUrls } from "@/constants";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-24 lg:py-32 px-4">
      <div className="container mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Personalized AI Training Plans
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[800px] mb-8">
          Trenova creates training plans tailored to your goals, abilities, and
          preferences. Achieve better results with workouts designed just for
          you.
        </p>
        <Button size="lg" asChild className="px-8 py-6 text-lg">
          <Link href={ProjectUrls.signUp}>Start for Free</Link>
        </Button>
      </div>
    </section>
  );
}
