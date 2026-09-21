import React from "react";
import { Bell, Menu } from "lucide-react";

export const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-border bg-background px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">

      {/* Left */}
      <div className="flex items-center gap-3">

        <button
          type="button"
          className="md:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest hidden sm:inline">
          Vehicle Assistance Portal
        </span>

      </div>

      {/* Right */}
      <div className="flex items-center gap-4">

        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />

          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="h-5 w-px bg-border" />

        {/* User */}
        <div className="flex items-center gap-3 pl-1">

          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-foreground leading-tight">
              John Doe
            </p>

            <p className="text-[11px] text-muted-foreground">
              Premium Member
            </p>
          </div>

          <div className="h-9 w-9 rounded-full bg-muted text-foreground border border-border flex items-center justify-center text-xs font-bold">
            JD
          </div>

        </div>

      </div>

    </header>
  );
};













