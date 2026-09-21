import React from "react";
import { Loader2 } from "lucide-react";

export const LoadingState: React.FC = () => {
  return (
    <div className="py-20 flex flex-col items-center justify-center space-y-2 text-muted-foreground">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <span className="text-xs font-medium">Loading records...</span>
    </div>
  );
};