import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ShieldAlert, ArrowRight } from "lucide-react";
import type { EmergencySectionData } from "@/types/landing";
import { DynamicMedia } from "./DynamicMedia";

interface EmergencySectionProps {
  data: EmergencySectionData;
}

export const EmergencySection: React.FC<EmergencySectionProps> = ({ data }) => {
  return (
    <section id="emergency" className="relative py-24 overflow-hidden border-y border-border">
      {/* Background Dynamic Media */}
      <div className="absolute inset-0 z-0">
        <DynamicMedia
          type={data.mediaType}
          src={data.mediaUrl}
          poster={data.posterUrl}
          alt="Emergency assistance backdrop"
          className="w-full h-full object-cover brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-destructive/15 border border-destructive/30 text-primary text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldAlert className="h-4 w-4" />
            <span>{data.badge}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-heading leading-tight">
            {data.heading}
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {data.description}
          </p>

          <ul className="space-y-3 pt-2">
            {data.bullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-foreground/90">
                <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Link
              to={data.button.href}
              className="inline-flex items-center gap-2.5 h-12 px-8 rounded-xl bg-destructive hover:opacity-90 text-primary-foreground font-semibold text-xs sm:text-sm shadow-xl shadow-destructive/20 transition-all"
            >
              <span>{data.button.label}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};