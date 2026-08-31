export class User {
    constructor(

        public fullName: string,
        public email: string,
        public phoneNumber: string,
        private password: string,
        public role: string,
        public userId?: string,) {}

    getpassword() {
        return this.password
    }

}


