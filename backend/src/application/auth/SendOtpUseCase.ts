import { OtpPurpose } from "../../domain/User/entities/Otp.js";
import { IOtpRepository } from "../../domain/User/repositories/IOtpRepository.js";
import { IOtpService } from "../contracts/IOtpService.js";
import { ISendOtpUserUseCase } from "../interfaces/ISendOtpuserUserCase.js";

export class SendOtpUseCase implements ISendOtpUserUseCase {
    constructor(private readonly otpRepository : IOtpRepository, private readonly otpService : IOtpService){}
   async execute(userId: string, email: string, purpose: OtpPurpose): Promise<{ message: string}> {
         const otp = await this.otpService.generateOtp()
         if(!otp){
            throw new Error("error happend while creating the otp")
         }
         console.log(`${otp}`)
        return {message : `${otp}`}
    }
}