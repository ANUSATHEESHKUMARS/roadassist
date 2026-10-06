import React from "react";
import { Check } from "lucide-react";
import type{ VehicleCategoryItem } from "@/types/landing";

interface VehicleCardProps {
  item: VehicleCategoryItem;
  isActive: boolean;
  onSelect: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  item,
  isActive,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
        isActive
          ? "bg-card border-primary ring-1 ring-primary shadow-xl"
          : "bg-card/50 border-border hover:bg-card hover:border-border/80"
      }`}
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-foreground font-heading">{item.name}</h3>
          <span
            className={`h-2 w-2 rounded-full ${
              isActive ? "bg-primary animate-pulse" : "bg-muted-foreground/30"
            }`}
          />
        </div>
        <p className="text-[11px] text-primary font-mono">{item.tagline}</p>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-border/50 space-y-1.5">
        {item.specs.map((spec, idx) => (
          <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Check className="h-3 w-3 text-primary shrink-0" />
            <span>{spec}</span>
          </div>
        ))}
      </div>
    </div>
  );
};