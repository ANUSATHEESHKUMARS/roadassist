export type UserRole = "user" | "admin" | "mechanic" | "superadmin";

export interface AuthUser {
    userId: string;
    fullName: string;
    email: string;
    roles: UserRole[];
    activeRole: UserRole;
    /** Convenience alias used throughout the frontend for role-based checks */
    role: UserRole;
}

