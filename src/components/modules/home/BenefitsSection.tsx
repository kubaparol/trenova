import { Clock, Brain, Dumbbell, PiggyBank } from "lucide-react";
import { ReactNode } from "react";

export interface BenefitItem {
  icon: ReactNode;
  title: string;
  description: string;
}

function BenefitCard({ icon, title, description }: BenefitItem) {
  return (
    <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm border">
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-muted-foreground text-center">{description}</p>
    </div>
  );
}

export default function BenefitsSection() {
  return (
    <section className="py-16 md:py-24 px-4 bg-muted/50">
      <div className="container mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Dlaczego warto wybrać Trenova?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}

export const benefits: BenefitItem[] = [
  {
    icon: <Dumbbell className="h-6 w-6" />,
    title: "Pełna personalizacja",
    description:
      "Plany treningowe dostosowane do Twoich celów, możliwości i preferencji.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Oszczędność czasu",
    description:
      "Gotowy plan treningowy w kilka minut, bez konieczności samodzielnego planowania.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Ekspertyza AI",
    description:
      "Wykorzystujemy zaawansowane algorytmy AI oparte na wiedzy ekspertów fitness.",
  },
  {
    icon: <PiggyBank className="h-6 w-6" />,
    title: "Niższy koszt",
    description:
      "Znacznie tańsze niż indywidualne konsultacje z trenerem personalnym.",
  },
];
