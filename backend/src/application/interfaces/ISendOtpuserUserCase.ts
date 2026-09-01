import { OtpPurpose } from "../../domain/User/entities/Otp.js";

export interface ISendOtpUserUseCase {
    execute(userId : string | undefined, email : string, purpose : OtpPurpose):Promise <{message : string}>
}