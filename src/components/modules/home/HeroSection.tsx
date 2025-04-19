import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectUrls } from "@/constants";

export default function HeroSection() {
  return (
    <section className="py-12 md:py-24 lg:py-32 px-4">
      <div className="container mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
          Spersonalizowane plany treningowe z&nbsp;AI
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-[800px] mb-8">
          Trenova tworzy plany treningowe dopasowane do Twoich celów, możliwości
          i preferencji. Osiągaj lepsze wyniki dzięki treningom stworzonym
          specjalnie dla Ciebie.
        </p>
        <Button size="lg" asChild className="px-8 py-6 text-lg">
          <Link href={ProjectUrls.signUp}>Rozpocznij za darmo</Link>
        </Button>
      </div>
    </section>
  );
}
