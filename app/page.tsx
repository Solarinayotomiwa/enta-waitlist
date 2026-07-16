import { Hero } from "@/components/Hero";
import { IntroSection } from "@/components/IntroSection";
import { CalculatorSection } from "@/components/CalculatorSection";
import { FeatureSection } from "@/components/FeatureSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { BuiltForSection } from "@/components/BuiltForSection";
import { FeaturesGridSection } from "@/components/FeaturesGridSection";
import { SecuritySection } from "@/components/SecuritySection";
import { WaitlistSection } from "@/components/WaitlistSection";
import { HistorySection } from "@/components/HistorySection";
import { BlogSection } from "@/components/BlogSection";
import { CtaSection } from "@/components/CtaSection";
import { FooterSection } from "@/components/FooterSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <IntroSection />
      <CalculatorSection />
      <FeatureSection />
      <HowItWorksSection />
      <BuiltForSection />
      <FeaturesGridSection />
      <SecuritySection />
      <WaitlistSection />
      <HistorySection />
      <BlogSection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
