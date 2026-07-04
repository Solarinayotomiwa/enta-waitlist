import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { CalculatorSection } from "@/components/CalculatorSection";
import { FeatureSection } from "@/components/FeatureSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { SecuritySection } from "@/components/SecuritySection";
import { FooterSection } from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <IntroSection />
      <CalculatorSection />
      <FeatureSection />
      <HowItWorksSection />
      <SecuritySection />
      <FooterSection />
    </main>
  );
}
