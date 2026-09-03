import { OtpPurpose } from "../../domain/User/entities/Otp.js";
import { IOtpRepository } from "../../domain/User/repositories/IOtpRepository.js";
import { IOtpService } from "../contracts/IOtpService.js";
import { ISendOtpUserUseCase } from "../interfaces/ISendOtpuserUserCase.js";
import { Otp } from "../../domain/User/entities/Otp.js";


export class SendOtpUseCase implements ISendOtpUserUseCase {
    constructor(private readonly otpRepository: IOtpRepository, private readonly otpService: IOtpService) { }
    async execute(userId: string, email: string, purpose: OtpPurpose): Promise<{ message: string ; otp : string}> {
        const otp = await this.otpService.generateOtp()
        const codeHash = await this.otpService.hashOtp(otp)
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
        const otpEntity = new Otp(userId,
            email,
            codeHash,
            purpose,
            expiresAt)
        await this.otpRepository.save(otpEntity)
    console.log("this is for generating" , otp)
     return {message : "success" , otp : otp}
    
    }
}