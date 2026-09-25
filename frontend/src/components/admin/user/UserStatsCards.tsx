import React from "react";
import { Users, UserCheck, UserX, Shield } from "lucide-react";
import type { UserStats } from "@/types/admin/user";

export const UserStatsCards: React.FC<{ stats: UserStats }> = ({ stats }) => {
  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "Platform accounts",
      icon: Users,
      iconColor: "text-foreground",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      description: "Operational status",
      icon: UserCheck,
      iconColor: "text-emerald-400",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers.toLocaleString(),
      description: "Restricted access",
      icon: UserX,
      iconColor: "text-primary",
    },
    {
      title: "Administrators",
      value: stats.adminUsers.toLocaleString(),
      description: "Root & elevated roles",
      icon: Shield,
      iconColor: "text-amber-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-card border border-border/80 rounded-xl p-4 flex flex-col justify-between shadow-xs transition-colors hover:border-border"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                {card.title}
              </span>
              <div className="h-7 w-7 rounded-lg bg-secondary border border-border flex items-center justify-center">
                <Icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold tracking-tight text-foreground font-heading">
                {card.value}
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {card.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};