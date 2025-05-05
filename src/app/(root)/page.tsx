import AITechnologySection from "@/components/modules/home/AITechnologySection";
import FinalCTASection from "@/components/modules/home/FinalCtaSection";
import HeroSection from "@/components/modules/home/HeroSection";
import HowItWorksSection from "@/components/modules/home/HowItWorksSection";
import PersonalizationSection from "@/components/modules/home/PersonalizationSection";
import ProgressTrackingSection from "@/components/modules/home/ProgressTrackingSection";
import SocialProofSection from "@/components/modules/home/SocialProofSection";

export default function Home() {
  return (
    <>
      <HeroSection />
      <HowItWorksSection />
      <PersonalizationSection />
      <ProgressTrackingSection />
      <AITechnologySection />
      <SocialProofSection />
      <FinalCTASection />
    </>
  );
}
