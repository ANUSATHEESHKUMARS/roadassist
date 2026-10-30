export type RegisterationRole = "user"|"admin";

export class PendingRegistration {
    constructor(
        public fullName : string,
        public email : string,
        public phoneNumber : string,
        private password : string,
        public roles :RegisterationRole,
        public expiresAt : Date

    ){}

    getPassword (){
        return this.password
    }
}