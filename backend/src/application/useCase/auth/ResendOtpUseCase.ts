import { IOtpRepository } from "../../../domain/repositories/IOtpRepository.js";
import { IPendingRegistrationRepository } from "../../../domain/repositories/IPendingRegistration.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { Otp } from "../../../domain/User/entities/Otp.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IEmailService } from "../../contracts/IEmailService.js";
import { IOtpService } from "../../contracts/IOtpService.js";
import { ResendOtpDto } from "../../dtos/resentOtp.js";
import { IResendOtpUseCase } from "../../interfaces/IResendOtpUseCase.js";

export class ResentOtpUseCase implements IResendOtpUseCase{
    constructor(private readonly otpRepository : IOtpRepository,
        private readonly otpService : IOtpService,
        private readonly emailService : IEmailService,
        private readonly pendinRegistrationRepository : IPendingRegistrationRepository
    ){}
   async execute(data: ResendOtpDto): Promise<{ message: string; }> {
     const {email , purpose} = data;
    
     const pendingRegistration = await this.pendinRegistrationRepository.findByEmail(email)

     if(!pendingRegistration){
        throw new NotfoundError("Pending registration not found" , "PENDING_REGISTRATION_NOT_FOUND")
     }
        await this.otpRepository.invalidateOtp(email, purpose);
        const otp = await this.otpService.generateOtp()
        const codeHash = await this.otpService.hashOtp(otp)
        const expiresAt = new Date(Date.now() + 60 * 1000)
        const otpEntity = new Otp(
            
            email,
            codeHash,
            purpose,
            expiresAt
        )
        await this.otpRepository.save(otpEntity)
        await this.emailService.sendOtp(email,otp)

        return {
            message : "OTP resent succesfully"
        }
    }
}