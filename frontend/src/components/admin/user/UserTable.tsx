import React from "react";
import { UserX, Loader2 } from "lucide-react";
import type { AdminUser } from "@/types/admin/user";
import { UserStatusBadge, UserRoleBadge, AuthProviderBadge } from "./UserStatusBadge";
import { UserActionsMenu } from "./UserActionsMenu";

interface UserTableProps {
  users: AdminUser[];
  isLoading?: boolean;
}

export const UserTable: React.FC<UserTableProps> = ({ users, isLoading = false }) => {
  return (
    <div className="w-full overflow-hidden border border-border/80 bg-card rounded-xl shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Auth Provider</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-xs font-medium">Loading user records...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <UserX className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                      No registered accounts match the selected filters or search terms.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const initials = user.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={user.userId}
                    className="hover:bg-muted/30 transition-colors group"
                  >
                    {/* User: Avatar + Name + User ID */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center font-bold text-[11px] text-foreground shrink-0 shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-foreground leading-tight">
                            {user.fullName}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                            ID: {user.userId}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-foreground/90 font-mono text-[11px]">
                      {user.email}
                    </td>

                    {/* Phone */}
                    <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                      {user.phoneNumber || "—"}
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4">
                      <UserRoleBadge role={user.role} />
                    </td>

                    {/* Auth Provider */}
                    <td className="py-3 px-4">
                      <AuthProviderBadge provider={user.authProvider} />
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <UserStatusBadge status={user.status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <UserActionsMenu user={user} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};