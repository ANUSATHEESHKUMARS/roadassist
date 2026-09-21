import React from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionMenuProps {
  onDetails?: () => void;
  onMore?: () => void;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ onDetails, onMore }) => {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <Button
        variant="outline"
        size="sm"
        onClick={onDetails}
        className="h-7 px-2.5 text-[11px] bg-input border-border hover:bg-muted text-foreground hover:border-primary/40 rounded-md transition-colors"
      >
        Details
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onMore}
        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
      >
        <MoreVertical className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
};