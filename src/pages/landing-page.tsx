import { Navbar } from "@/features/landing/components/navbar";
import { HeroSection } from "@/features/landing/components/hero-section";
import { TrustBar } from "@/features/landing/components/trust-bar";
import { ProblemsSection } from "@/features/landing/components/problems-section";
import { SolutionsSection } from "@/features/landing/components/solutions-section";
import { BenefitsSection } from "@/features/landing/components/benefits-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { BoliviaSection } from "@/features/landing/components/bolivia-section";
import { DemoFormSection } from "@/features/landing/components/demo-form-section";
import { SiteFooter } from "@/features/landing/components/site-footer";

export function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="scroll-mt-18 [&_section]:scroll-mt-18">
        <HeroSection />
        <TrustBar />
        <ProblemsSection />
        <SolutionsSection />
        <BenefitsSection />
        <HowItWorksSection />
        <BoliviaSection />
        <DemoFormSection />
      </main>
      <SiteFooter />
    </>
  );
}
