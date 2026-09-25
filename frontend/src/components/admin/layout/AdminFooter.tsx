import React from "react";

export const AdminFooter: React.FC = () => {
  return (
    <footer className="w-full shrink-0 border-t border-border bg-card py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-between gap-2 sm:flex-row text-center sm:text-left text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            RoadAssist Enterprise
          </span>
          <span>•</span>
          <span>Internal Administration</span>
        </div>

        <div>
          © 2026 RoadAssist Enterprise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};