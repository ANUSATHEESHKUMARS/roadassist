import React from "react";
import type{ LandingPageData } from "@/types/landing";
import  { ServiceCard } from "./ServiceCard";

interface ServicesSectionProps {
  data: LandingPageData["services"];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ data }) => {
  return (
    <section id="services" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
          Comprehensive Capabilities
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mt-2">
          {data.heading}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
          {data.subheading}
        </p>
      </div>

      {/* Asymmetric Service Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data.items.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};