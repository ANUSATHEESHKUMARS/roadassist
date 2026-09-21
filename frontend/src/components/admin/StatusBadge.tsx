import React from "react";

export type StatusType =
  | "Active"
  | "Inactive"
  | "Blocked"
  | "Pending"
  | "PREMIUM"
  | "STANDARD";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const normalized = status.toUpperCase();

  if (normalized === "ACTIVE") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }

  if (normalized === "BLOCKED") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-primary ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        Blocked
      </span>
    );
  }

  if (normalized === "INACTIVE" || normalized === "PENDING") {
    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground ${className}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
        {status}
      </span>
    );
  }

  if (normalized === "PREMIUM") {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border border-primary/40 bg-primary/10 text-primary ${className}`}>
        PREMIUM
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border border-border bg-muted/40 text-muted-foreground ${className}`}>
      STANDARD
    </span>
  );
};