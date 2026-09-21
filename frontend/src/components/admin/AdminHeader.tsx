import React from "react";
import { Bell, Settings, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const AdminHeader: React.FC = () => {
  return (
    <header className="h-16 border-b border-border bg-card px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input (UI Only) */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        <button
          type="button"
          className="md:hidden text-muted-foreground hover:text-foreground p-1"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Global dispatch or user search..."
            className="pl-9 h-9 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-lg"
          />
        </div>
      </div>

      {/* Right User & Actions Area */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
        >
          <Settings className="h-4 w-4" />
        </Button>

        <div className="h-5 w-px bg-border mx-1" />

        {/* Administrator Profile Display */}
        <div className="flex items-center gap-2 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-foreground leading-tight">
              Alex Rivera
            </p>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase">
              Fleet Director
            </p>
          </div>
          <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center text-xs font-semibold text-foreground">
            AR
          </div>
        </div>
      </div>
    </header>
  );
};