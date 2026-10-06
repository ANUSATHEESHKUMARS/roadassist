import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Activity } from "lucide-react";
import type { HeroData } from "@/types/landing";
import { DynamicMedia } from "./DynamicMedia";

interface HeroSectionProps {
  data: HeroData;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data }) => {
  return (
    <section className="relative min-h-[92vh] lg:min-h-screen w-full flex items-center justify-center overflow-hidden bg-background pt-20">
      {/* Background Dynamic Media with Cinematic Overlays */}
      <div className="absolute inset-0 z-0">
        <DynamicMedia
          type={data.mediaType}
          src={data.mediaUrl}
          poster={data.posterUrl}
          alt="RoadAssist dynamic background"
          className="w-full h-full object-cover brightness-[0.35] scale-105 transform motion-safe:animate-subtle-zoom"
        />

        {/* Ambient Darkened Gradient Masks */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background/60" />

        {/* Subtle Tech Grid Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        {data.headlineBadge && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-mono uppercase tracking-wider mb-6 shadow-sm">
            <Activity className="h-3 w-3 animate-pulse" />
            <span>{data.headlineBadge}</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-heading leading-[1.15] max-w-4xl">
          {data.title}{" "}
          <span className="text-primary underline decoration-primary/40 underline-offset-8">
            {data.titleAccent}
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {data.description}
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link
            to={data.primaryButton.href}
            className="w-full sm:w-auto h-12 px-7 rounded-xl bg-primary hover:opacity-90 text-primary-foreground text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all hover:translate-y-[-1px]"
          >
            <span>{data.primaryButton.label}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <a
            href={data.secondaryButton.href}
            className="w-full sm:w-auto h-12 px-7 rounded-xl bg-secondary/80 hover:bg-muted border border-border text-foreground text-xs sm:text-sm font-semibold flex items-center justify-center transition-colors"
          >
            {data.secondaryButton.label}
          </a>
        </div>
      </div>

      {/* Bottom Visual Fade to Trust Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};