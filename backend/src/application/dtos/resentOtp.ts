import { OtpPurpose } from "../../domain/User/entities/Otp.js";

export interface ResendOtpDto{
    email: string,
    purpose: OtpPurpose
}