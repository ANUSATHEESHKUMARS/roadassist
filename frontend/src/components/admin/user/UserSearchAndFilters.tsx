import React from "react";
import { Search, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface UserSearchAndFiltersProps {
  searchQuery?: string;
  roleFilter?: string;
  statusFilter?: string;
  providerFilter?: string;
}

export const UserSearchAndFilters: React.FC<UserSearchAndFiltersProps> = ({
  searchQuery = "",
  roleFilter = "all",
  statusFilter = "all",
  providerFilter = "all",
}) => {
  return (
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card border border-border/80 rounded-xl p-3 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          defaultValue={searchQuery}
          placeholder="Search by name, ID, email, or phone number..."
          className="pl-9 h-9 bg-input border-border text-xs text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary w-full"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Role Filter */}
        <select
          defaultValue={roleFilter}
          className="h-9 px-2.5 rounded-lg border border-border bg-input text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="all">Role: All</option>
          <option value="user">User</option>
          <option value="mechanic">Mechanic</option>
          <option value="admin">Admin</option>
        </select>

        {/* Status Filter */}
        <select
          defaultValue={statusFilter}
          className="h-9 px-2.5 rounded-lg border border-border bg-input text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="all">Status: All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>

        {/* Auth Provider Filter */}
        <select
          defaultValue={providerFilter}
          className="h-9 px-2.5 rounded-lg border border-border bg-input text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="all">Provider: All</option>
          <option value="LOCAL">Local</option>
          <option value="GOOGLE">Google</option>
        </select>

        {/* Reset Action */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Reset Filters"
          className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg shrink-0 cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};