import React, { useState } from "react";
import type { LandingPageData } from "@/types/landing";
import { VehicleCard } from "./VehicleCard";
import type { MediaResponseData } from "@/types/media";
interface VehicleSupportSectionProps {
  data: LandingPageData["vehicles"];
  media?: MediaResponseData
}

export const VehicleSupportSection: React.FC<VehicleSupportSectionProps> = ({ data, media }) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const currentCategory = data.categories[selectedIndex] || data.categories[0];

  return (
    <section id="vehicles" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mb-12">
        <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
          Comprehensive Fleet Support
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mt-2">
          {data.heading}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
          {data.subheading}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Interactive Category Pickers */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {data.categories.map((cat, idx) => (
            <VehicleCard
              key={cat.id}
              item={cat}
              isActive={selectedIndex === idx}
              onSelect={() => setSelectedIndex(idx)}
            />
          ))}
        </div>

        {/* Right: Large Highlight Preview Managed by CMS */}
        {/* <div className="lg:col-span-7 h-[420px] lg:h-[500px] rounded-2xl overflow-hidden border border-border bg-card relative shadow-2xl">
          <img
            src={currentCategory.imageUrl}
            alt={currentCategory.name}
            className="w-full h-full object-cover object-center transition-all duration-500 brightness-75 scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="absolute bottom-6 left-6 right-6 p-6 rounded-xl bg-background/85 backdrop-blur-md border border-border/80 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary">
              Active Category Specification
            </span>
            <h4 className="text-lg font-bold text-foreground font-heading mt-1">
              {currentCategory.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {currentCategory.description}
            </p>
          </div>
        </div> */}

        {media?.mediaType === "image" && media.url ? (
          <img
            src={media.url}
            alt="RoadAssist vehicle support"
            className="w-full h-full object-cover object-center transition-all duration-500 brightness-75"
          />
        ) : (
          <img
            src={currentCategory.imageUrl}
            alt={currentCategory.name}
            className="w-full h-full object-cover object-center transition-all duration-500 brightness-75"
          />
        )}
      </div>
    </section>
  );
};