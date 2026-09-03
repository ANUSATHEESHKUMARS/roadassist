import { OtpPurpose } from "../../domain/User/entities/Otp.js";

export interface otpDto {
    email : string ,
    otp : string,
    purpose : OtpPurpose

}