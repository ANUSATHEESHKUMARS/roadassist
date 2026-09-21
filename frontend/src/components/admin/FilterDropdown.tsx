import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilterDropdownProps {
  label: string;
  value: string;
  options?: string[];
  onChange?: (val: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
}) => {
  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 px-3 bg-card border-border hover:bg-muted text-xs text-muted-foreground hover:text-foreground font-normal rounded-lg flex items-center gap-1.5 shrink-0"
    >
      <span>{label}:</span>
      <span className="font-semibold text-foreground">{value}</span>
    </Button>
  );
};

export const FilterIconButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      className="h-9 w-9 bg-card border-border hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg shrink-0"
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />
    </Button>
  );
};