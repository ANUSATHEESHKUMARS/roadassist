export class User {
    constructor(

        public fullName: string,
        public email: string,
        public phoneNumber: string,
        private password: string | undefined,
        public role: UserRole,
        public userId?: string,
        public googleId?:string,
        public authProvider:AuthProvider = "LOCAL"
    
    ) {}

    getpassword() {
        return this.password
    }

}

export type UserRole = "user"|"mechanic"|"admin";
export type AuthProvider = "LOCAL"|"GOOGLE"