export type UserRole = "user" | "mechanic" | "admin";

export type UserStatus = "active" | "blocked";

export type AuthProvider = "LOCAL" | "GOOGLE";

export interface AdminUser {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    role: UserRole;
    authProvider: AuthProvider;
    status: UserStatus;
}

export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    adminUsers: number;
}