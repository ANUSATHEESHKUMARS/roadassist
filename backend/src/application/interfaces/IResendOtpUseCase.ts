import { ResendOtpDto } from "../dtos/resentOtp.js";

export interface IResendOtpUseCase{
    execute(data : ResendOtpDto):Promise<{message:string}>
}