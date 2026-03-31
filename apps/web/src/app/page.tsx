import VSCodeHeader from "@/components/landing/VSCodeHeader";
import HeroSection from "@/components/landing/HeroSection";
import PainSection from "@/components/landing/PainSection";
import SolutionSection from "@/components/landing/SolutionSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import CommunicationSection from "@/components/landing/CommunicationSection";
import ManagersSection from "@/components/landing/ManagersSection";
import DevelopersSection from "@/components/landing/DevelopersSection";
import ThreeRolesSection from "@/components/landing/ThreeRolesSection";
import PossibilitiesSection from "@/components/landing/PossibilitiesSection";
import FinalCTASection from "@/components/landing/FinalCTASection";

export default function MarketingPage() {
  return (
    <main className="relative bg-background text-foreground overflow-x-hidden">
      {/* Global grid background */}
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: `linear-gradient(hsl(155 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(155 100% 50%) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <VSCodeHeader />

      <div id="hero"><HeroSection /></div>
      <div id="pain"><PainSection /></div>
      <div id="solution"><SolutionSection /></div>
      <div id="how"><HowItWorksSection /></div>
      <div id="comm"><CommunicationSection /></div>
      <div id="managers"><ManagersSection /></div>
      <div id="devs"><DevelopersSection /></div>
      <ThreeRolesSection />
      <PossibilitiesSection />
      <FinalCTASection />
    </main>
  );
}
