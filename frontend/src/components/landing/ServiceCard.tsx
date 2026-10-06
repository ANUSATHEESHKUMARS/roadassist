import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type{ ServiceItem } from "@/types/landing";

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div
      className={`group relative rounded-2xl overflow-hidden border border-border bg-card shadow-sm hover:border-border/80 transition-all duration-300 flex flex-col justify-between ${
        service.isFeatured ? "md:col-span-2 md:row-span-2 min-h-[380px]" : "min-h-[280px]"
      }`}
    >
      {/* Background Image Managed by CMS */}
      <div className="absolute inset-0 z-0">
        <img
          src={service.imageUrl}
          alt={service.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-[0.38] group-hover:brightness-[0.45]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
      </div>

      {/* Top Tag & Interactive Arrow */}
      <div className="relative z-10 p-6 flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-md">
          Field Dispatch
        </span>
        <div className="h-8 w-8 rounded-full bg-secondary/80 border border-border flex items-center justify-center text-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-200">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 p-6">
        <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground font-heading">
          {service.title}
        </h3>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {service.description}
        </p>

        <Link
          to={service.link}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary mt-4 hover:underline"
        >
          <span>Request dispatch</span>
        </Link>
      </div>
    </div>
  );
};