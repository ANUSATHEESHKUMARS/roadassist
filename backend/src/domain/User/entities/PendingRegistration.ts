export type RegisterationRole = "user" | "admin";

export class PendingRegistration {
    constructor(
        public fullName: string,
        public email: string,
        public phoneNumber: string,
        private password: string,
        public expiresAt: Date,
        public role: RegisterationRole = "user"

    ) { }

    getPassword() {
        return this.password
    }
}