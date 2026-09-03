import { otpDto } from "../dtos/otp.js";

export interface IVerifyOtpUseCase {
 verify(otpDto :otpDto):Promise<{message : string}>
}