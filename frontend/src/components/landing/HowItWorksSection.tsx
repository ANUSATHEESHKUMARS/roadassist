import React from "react";
import type{ LandingPageData } from "@/types/landing";

interface HowItWorksProps {
  data: LandingPageData["howItWorks"];
}

export const HowItWorksSection: React.FC<HowItWorksProps> = ({ data }) => {
  return (
    <section id="how-it-works" className="py-24 bg-card/40 border-y border-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold">
            Seamless Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mt-2">
            {data.heading}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 leading-relaxed">
            {data.subheading}
          </p>
        </div>

        {/* 4-Step Process Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {data.steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-sm relative group hover:border-border/80 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black font-mono text-primary/80">
                    {step.step}
                  </span>
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                </div>

                <div className="h-32 w-full rounded-xl overflow-hidden bg-secondary border border-border/80 mb-5">
                  <img
                    src={step.imageUrl}
                    alt={step.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 brightness-90"
                  />
                </div>

                <h3 className="text-base font-bold text-foreground tracking-tight font-heading">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-border/50 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Phase {step.step} of 04
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};