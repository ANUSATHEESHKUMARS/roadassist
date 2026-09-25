import React from "react";
import { Download, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UserManagementHeaderProps {
  onExportClick?: () => void;
  onAddUserClick?: () => void;
}

export const UserManagementHeader: React.FC<UserManagementHeaderProps> = ({
  onExportClick,
  onAddUserClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/40">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
          User Management
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage registered users, account status, roles and platform access permissions.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <Button
          type="button"
          variant="outline"
          onClick={onExportClick}
          className="h-9 px-3.5 text-xs bg-card border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
        >
          <Download className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
          <span>Export CSV</span>
        </Button>

        <Button
          type="button"
          onClick={onAddUserClick}
          className="h-9 px-3.5 text-xs font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          <span>Add User</span>
        </Button>
      </div>
    </div>
  );
};