export class PendingRegistration {
    constructor(
        public fullName : string,
        public email : string,
        public phoneNumber : string,
        private password : string,
        public expiresAt : Date

    ){}

    getPassword (){
        return this.password
    }
}