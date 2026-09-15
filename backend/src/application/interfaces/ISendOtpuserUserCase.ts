import { OtpPurpose } from "../../domain/User/entities/Otp.js";

export interface ISendOtpUserUseCase {
    execute( email : string, purpose : OtpPurpose):Promise <{message : string; }>
}