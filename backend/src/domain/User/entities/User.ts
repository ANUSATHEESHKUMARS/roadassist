export class User {
    constructor(

        public fullName: string,
        public email: string,
        public phoneNumber: string,
        private password: string,
        public role: UserRole,
        public userId?: string,) {}

    getpassword() {
        return this.password
    }

}

export type UserRole = "user"|"mechanic"|"admin"|"super_admin"
