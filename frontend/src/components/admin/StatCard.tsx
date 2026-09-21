import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendDirection?: "up" | "down";
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = "up",
  description,
}) => {
  return (
    <div className="relative bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-sm overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[11px] font-medium ${
              trendDirection === "up" ? "text-emerald-400" : "text-primary"
            }`}
          >
            {trendDirection === "up" ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          {title}
        </p>
        <p className="text-xl font-bold tracking-tight text-foreground mt-0.5">
          {value}
        </p>
        {description && (
          <p className="text-[11px] text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
};