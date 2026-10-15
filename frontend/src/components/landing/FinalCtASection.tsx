import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { FinalCTAData } from "@/types/landing";
import { DynamicMedia } from "./DynamicMedia";
import type { MediaResponseData } from "@/types/media";

interface FinalCTAProps {
  data: FinalCTAData
  media?:MediaResponseData
}

export const FinalCTASection: React.FC<FinalCTAProps> = ({ data, media }) => {
  return (
    <section className="relative py-28 overflow-hidden border-t border-border">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <DynamicMedia
          type={data.mediaType}
          src={data.mediaUrl}
          poster={data.posterUrl}
          alt="Final CTA background"
          className="w-full h-full object-cover brightness-[0.25]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-heading">
          {data.heading}
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          {data.description}
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={data.primaryButton.href}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-primary/20 transition-all"
          >
            <span>{data.primaryButton.label}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          {data.secondaryButton && (
            <Link
              to={data.secondaryButton.href}
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-secondary/80 hover:bg-muted border border-border text-foreground font-semibold text-xs sm:text-sm flex items-center justify-center transition-colors"
            >
              {data.secondaryButton.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};