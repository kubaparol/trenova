import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
  value: string;
}

export default function FAQSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Najczęściej zadawane pytania
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.value} value={faq.value}>
              <AccordionTrigger className="text-left text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

const faqs: FAQItem[] = [
  {
    question: "Jak działa Trenova?",
    answer:
      "Trenova wykorzystuje sztuczną inteligencję do tworzenia spersonalizowanych planów treningowych. Wystarczy, że odpowiesz na kilka pytań dotyczących Twoich celów, doświadczenia i preferencji, a nasz system AI stworzy plan treningowy dopasowany do Twoich potrzeb.",
    value: "faq-1",
  },
  {
    question: "Czy mogę korzystać z Trenova bez doświadczenia treningowego?",
    answer:
      "Tak, Trenova jest dostosowana do wszystkich poziomów zaawansowania, od początkujących po zaawansowanych. Nasz system uwzględnia Twoje doświadczenie i tworzy plan odpowiedni dla Twojego poziomu.",
    value: "faq-2",
  },
  {
    question: "Czy mogę modyfikować wygenerowany plan treningowy?",
    answer:
      "Tak, możesz dostosować wygenerowany plan do swoich potrzeb. Jeśli jakieś ćwiczenie Ci nie odpowiada lub chcesz zmienić dzień treningowy, możesz łatwo wprowadzić zmiany w swoim planie.",
    value: "faq-3",
  },
  {
    question: "Ile kosztuje korzystanie z Trenova?",
    answer:
      "Oferujemy darmowy plan podstawowy oraz plany premium z dodatkowymi funkcjami. Szczegółowe informacje o cenach znajdziesz na stronie cennika po rejestracji.",
    value: "faq-4",
  },
  {
    question: "Czy mogę korzystać z Trenova na urządzeniu mobilnym?",
    answer:
      "Tak, Trenova jest w pełni responsywna i działa na wszystkich urządzeniach - komputerach, tabletach i smartfonach.",
    value: "faq-5",
  },
];
