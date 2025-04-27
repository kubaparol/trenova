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
          Frequently Asked Questions
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
    question: "How does Trenova work?",
    answer:
      "Trenova uses artificial intelligence to create personalized training plans. Simply answer a few questions about your goals, experience, and preferences, and our AI system will generate a plan tailored to your needs.",
    value: "faq-1",
  },
  {
    question: "Can I use Trenova without any training experience?",
    answer:
      "Yes, Trenova is suitable for all fitness levels, from beginners to advanced. Our system considers your experience and creates a plan appropriate for your level.",
    value: "faq-2",
  },
  {
    question: "Can I modify the generated training plan?",
    answer:
      "Yes, you can customize the generated plan to your needs. If an exercise doesn't suit you or you want to change a training day, you can easily make adjustments to your plan.",
    value: "faq-3",
  },
  {
    question: "How much does Trenova cost?",
    answer:
      "We offer a free basic plan and premium plans with additional features. Detailed pricing information can be found on the pricing page after registration.",
    value: "faq-4",
  },
  {
    question: "Can I use Trenova on my mobile device?",
    answer:
      "Yes, Trenova is fully responsive and works on all devices - computers, tablets, and smartphones.",
    value: "faq-5",
  },
];
