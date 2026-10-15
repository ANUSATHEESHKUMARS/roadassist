import React, { useEffect, useState } from "react";

import { mockLandingData } from "@/data/landinData";
import type { LandingPageData } from "@/types/landing";

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

import type { MediaResponseData } from "@/types/media";
import { getPublicMedia } from "@/services/mediaService";

export default function LandingPage() {
  const [landingData] =
    useState<LandingPageData>(mockLandingData);

  const [mediaList, setMediaList] =
    useState<MediaResponseData[]>([]);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const response = await getPublicMedia();
        setMediaList(response.data);
      } catch (error) {
        console.error(
          "Failed to load landing media:",
          error
        );
      }
    };

    loadMedia();
  }, []);

  const heroMedia = mediaList.find(
    (media) => media.section === "hero"
  );
  const servicesMedia = mediaList.find(
    (media) => media.section === "services"
  );

  const howItWorksMedia = mediaList.find(
    (media) => media.section === "how-it-works"
  );

  const vehiclesMedia = mediaList.find(
    (media) => media.section === "vehicles"
  );

  const whyRoadAssistMedia = mediaList.find(
    (media) => media.section === "why-roadassist"
  );

  const membershipMedia = mediaList.find(
    (media) => media.section === "membership"
  );
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground overflow-x-hidden">

      <LandingNavbar data={landingData.nav} />

      <main>

        <HeroSection
          data={landingData.hero}
          media={heroMedia}
        />

        <ServicesSection
          data={landingData.services}
          media={servicesMedia}

        />

        <HowItWorksSection
          data={landingData.howItWorks}
          media={howItWorksMedia}
        />

        <VehicleSupportSection
          data={landingData.vehicles}
        />

        <EmergencySection
          data={landingData.emergency}


        />

        <WhyRoadAssistSection
          data={landingData.whyRoadAssist}
        />

        <PremiumSection
          data={landingData.premium}
          media={membershipMedia}

        />

        <FinalCTASection
          data={landingData.finalCta}

        />

      </main>

      <LandingFooter data={landingData.footer} />

    </div>
  );
}