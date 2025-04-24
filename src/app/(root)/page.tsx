import BenefitsSection from "@/components/modules/home/BenefitsSection";
import FAQSection from "@/components/modules/home/FAQSection";
import HeroSection from "@/components/modules/home/HeroSection";

export const runtime = "edge";

export default function Home() {
  return (
    <>
      <HeroSection />
      <BenefitsSection />
      <FAQSection />
    </>
  );
}
