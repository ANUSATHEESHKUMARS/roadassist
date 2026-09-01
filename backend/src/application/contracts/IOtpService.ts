export interface IOtpService {
    generateOtp(): Promise<string>
    hashOtp(otp :string): Promise<string>;
    compareOtp(otp:string , hashed : string):Promise<boolean>
}