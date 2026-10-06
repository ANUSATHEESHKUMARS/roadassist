import React from "react";
import { ShieldCheck, Navigation, FileCheck, Layers } from "lucide-react";
import type { WhyRoadAssistData } from "@/types/landing";

interface WhyRoadAssistProps {
  data: WhyRoadAssistData;
}

const iconRegistry = {
  ShieldCheck,
  Navigation,
  FileCheck,
  Layers,
};

export const WhyRoadAssistSection: React.FC<WhyRoadAssistProps> = ({ data }) => {
  return (
    <section id="why-roadassist" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-20">
        {data.stats.map((stat, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between"
          >
            <span className="text-3xl sm:text-4xl font-black font-mono text-primary tracking-tight">
              {stat.metric}
            </span>
            <span className="text-xs text-muted-foreground mt-2 font-medium">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Narrative & Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <div className="lg:col-span-5 space-y-4">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
            {data.badge}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-heading">
            {data.heading}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {data.description}
          </p>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.features.map((feature) => {
            const Icon = iconRegistry[feature.iconName as keyof typeof iconRegistry] || ShieldCheck;
            return (
              <div
                key={feature.id}
                className="p-6 rounded-2xl bg-card border border-border/80 hover:border-border transition-colors space-y-3"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-foreground font-heading">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};