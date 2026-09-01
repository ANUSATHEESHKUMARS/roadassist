import { Otp, OtpPurpose } from "../entities/Otp.js"

export interface IOtpRepository {
    save(otp: Otp): Promise<void>
    // findByEmail(email : string , purpose : OtpPurpose): Promise<Otp | null>
    // delete(email : string , purpose : OtpPurpose):Promise<void>
}