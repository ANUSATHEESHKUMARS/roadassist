import React from "react";
import type { VehicleStatus } from "@/types/user/vehicle";

interface VehicleStatusBadgeProps {
  status: VehicleStatus;
  className?: string;
}

export const VehicleStatusBadge: React.FC<VehicleStatusBadgeProps> = ({
  status,
  className = "",
}) => {
  switch (status) {
    case "ACTIVE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          ACTIVE
        </span>
      );
    case "NEEDS SERVICE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          NEEDS SERVICE
        </span>
      );
    case "PENDING VERIFICATION":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          PENDING
        </span>
      );
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-slate-100 text-slate-700 border border-slate-200/80 shadow-xs ${className}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          {status}
        </span>
      );
  }
};