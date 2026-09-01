export class Otp {
    constructor(
        public readonly userId : string,
        public readonly codeHash : string,
        public readonly purpose : OtpPurpose,
        public readonly expiresAt : Date,
        public attempts : number = 0,
        public used : boolean = false,
        public readonly createdAt : Date = new Date()
    ){}
}


export type OtpPurpose = | "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" | "PASSWORD_RESET" | "LOGIN"
