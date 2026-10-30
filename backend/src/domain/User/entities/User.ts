export type AccountStatus = "active"| "blocked"
export class User {
    constructor(

        public fullName: string,
        public email: string,
        public phoneNumber: string,
        private password: string | undefined,
        public roles: UserRole[],
        public userId?: string,
        public googleId?:string,
        public authProvider:AuthProvider = "LOCAL",
        public status : AccountStatus ="active",
        public activeRole:UserRole = "user"
    
    ) {}

    getpassword() {
        return this.password
    }

}

export type UserRole = "user"|"mechanic"|"admin" | "superadmin";
export type AuthProvider = "LOCAL"|"GOOGLE"