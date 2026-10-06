import React, { useState } from "react";
import { mockLandingData } from "@/data/landinData";
import type { LandingPageData } from "@/types/landing";

// Section Components
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { VehicleSupportSection } from "@/components/landing/VehicleSupportSection";
import { EmergencySection } from "@/components/landing/EmergencySection";
import { WhyRoadAssistSection } from "@/components/landing/WhyRoadAssistSection";
import { PremiumSection } from "@/components/landing/PremiumSection";
import { FinalCTASection } from "@/components/landing/FinalCtASection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  // Stored in local state, ready for:
  // useEffect(() => { apiClient.get("/landing").then(res => setLandingData(res.data)); }, []);
  const [landingData] = useState<LandingPageData>(mockLandingData);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* 1. Header / Navbar */}
      <LandingNavbar data={landingData.nav} />

      <main>
        {/* 2. Hero Section */}
        <HeroSection data={landingData.hero} />

        {/* 3. Trust Strip */}

        {/* 4. Services Grid */}
        <ServicesSection data={landingData.services} />

        {/* 5. How It Works Timeline */}
        <HowItWorksSection data={landingData.howItWorks} />

        {/* 6. Vehicle Support Matrix */}
        <VehicleSupportSection data={landingData.vehicles} />

        {/* 7. Emergency Alert Section */}
        <EmergencySection data={landingData.emergency} />

        {/* 8. Value Proposition & Telemetry Stats */}
        <WhyRoadAssistSection data={landingData.whyRoadAssist} />

        {/* 9. Premium Tier Showcase */}
        <PremiumSection data={landingData.premium} />

        {/* 10. Final Call To Action */}
        <FinalCTASection data={landingData.finalCta} />
      </main>

      {/* 11. Footer */}
      <LandingFooter data={landingData.footer} />
    </div>
  );
}