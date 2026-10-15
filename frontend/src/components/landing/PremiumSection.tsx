import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowRight } from "lucide-react";
import type { PremiumTierData } from "@/types/landing";
import type { MediaResponseData } from "@/types/media";

interface PremiumSectionProps {
  data: PremiumTierData
  media?: MediaResponseData
}

export const PremiumSection: React.FC<PremiumSectionProps> = ({ data, media }) => {
  return (
    <section id="membership" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Presentation & Benefits */}
        <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between space-y-8">
          <div className="space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-widest text-primary font-semibold bg-primary/10 border border-primary/20 px-3 py-1 rounded-md">
              {data.badge}
            </span>

            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground font-heading">
              {data.heading}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {data.tagline}
            </p>

            <div className="pt-2 text-xs font-mono text-muted-foreground">
              {data.priceDescriptor}
            </div>
          </div>

          <ul className="space-y-3 pt-2">
            {data.benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-center gap-3 text-xs text-foreground/90">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Link
              to={data.ctaButton.href}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-primary hover:opacity-90 text-primary-foreground font-semibold text-xs shadow-lg transition-all"
            >
              <span>{data.ctaButton.label}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Right: Visual Artwork Managed by S3 */}
        <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-secondary">
          {media?.mediaType === "video" ? (
            <video
              src={media.url}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            />
          ) : media?.url ? (
            <img
              src={media.url}
              alt="Premium"
              className="w-full h-full object-cover"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-card via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
};