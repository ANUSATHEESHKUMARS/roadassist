import React from "react";
import { Menu, Bell } from "lucide-react";

interface AdminHeaderProps {
  onMenuClick: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-xs sm:px-6 lg:px-8">
      {/* Left: Mobile Navigation Trigger & Brand Indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring md:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground hidden sm:inline">
          Console
        </span>
      </div>

      {/* Right: Notification Placeholder & Admin Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Icon Placeholder */}
        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="View notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="h-5 w-px bg-border" aria-hidden="true" />

        {/* Administrator Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="hidden flex-col text-right sm:flex">
            <span className="text-xs font-semibold leading-none text-foreground">
              Admin
            </span>
            <span className="mt-1 font-mono text-[10px] uppercase tracking-wider text-primary">
              Administrator
            </span>
          </div>

          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary font-mono text-xs font-bold text-foreground"
            aria-label="Admin avatar placeholder"
          >
            AD
          </div>
        </div>
      </div>
    </header>
  );
};