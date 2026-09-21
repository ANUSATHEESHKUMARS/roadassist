import React from "react";
import { UserX } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No users found",
  description = "No registered users match your current criteria.",
}) => {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center space-y-2.5">
      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
        <UserX className="h-5 w-5 text-muted-foreground" />
      </div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
};