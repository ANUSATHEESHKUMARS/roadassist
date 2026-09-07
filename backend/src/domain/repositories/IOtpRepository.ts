import { Otp, OtpPurpose } from "../entities/Otp.js"

export interface IOtpRepository {
    save(otp: Otp): Promise<void>
    findByEmailAndPurpose(email : string , purpose : OtpPurpose): Promise<Otp | null>
    incrementAttemps(email : string , purpose : OtpPurpose):Promise<void>
    markAsUsed(email : string , purpose : OtpPurpose):Promise<void>
}