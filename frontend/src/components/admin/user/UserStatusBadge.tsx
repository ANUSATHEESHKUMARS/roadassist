import React from "react";
import type{ UserRole, UserStatus, AuthProvider } from "@/types/admin/user";

export const UserStatusBadge: React.FC<{ status: UserStatus }> = ({ status }) => {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-destructive/10 text-primary border border-destructive/20">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
      Blocked
    </span>
  );
};

export const UserRoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const styles: Record<UserRole, string> = {
    admin: "bg-primary/10 text-primary border-primary/20",
    mechanic: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    user: "bg-secondary text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono uppercase tracking-wide border ${styles[role]}`}
    >
      {role}
    </span>
  );
};

export const AuthProviderBadge: React.FC<{ provider: AuthProvider }> = ({ provider }) => {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          provider === "GOOGLE" ? "bg-blue-400" : "bg-neutral-500"
        }`}
      />
      {provider}
    </span>
  );
};