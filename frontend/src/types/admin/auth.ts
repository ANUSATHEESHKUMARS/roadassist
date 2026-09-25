export interface AuthUser {
    userId: string,
    fullName:string,
    email: string,
    role: "user" | "admin" | "mechanic"
}

