import React, { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Eye, Edit3, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";
import type { AdminUser } from "@/types/admin/user";

export const UserActionsMenu: React.FC<{ user: AdminUser }> = ({ user }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [open]);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
        aria-label="User actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-44 rounded-xl bg-card border border-border shadow-xl py-1 z-50 animate-in fade-in-50 zoom-in-95">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full px-3 py-1.5 text-xs text-left text-foreground hover:bg-muted flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-muted-foreground" />
            <span>View Details</span>
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full px-3 py-1.5 text-xs text-left text-foreground hover:bg-muted flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Edit User</span>
          </button>

          <div className="h-px bg-border my-1" />

          {user.status === "active" ? (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full px-3 py-1.5 text-xs text-left text-primary hover:bg-destructive/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Block Account</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full px-3 py-1.5 text-xs text-left text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Unblock Account</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full px-3 py-1.5 text-xs text-left text-primary hover:bg-destructive/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete User</span>
          </button>
        </div>
      )}
    </div>
  );
};