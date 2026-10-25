import { IOtpRepository } from "../../../domain/repositories/IOtpRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { Otp } from "../../../domain/User/entities/Otp.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IEmailService } from "../../contracts/IEmailService.js";
import { IOtpService } from "../../contracts/IOtpService.js";
import { IRequestPasswordResetUseCase } from "../../interfaces/IRequestPasswordResetUseCase.js";

export class RequestPasswordResetUseCase implements IRequestPasswordResetUseCase{
  constructor(private readonly userRepository: IUserRepository,
    private readonly otpRepository:IOtpRepository,
    private readonly otpService:IOtpService,
    private readonly emailService :IEmailService
  ){}

 async execute(email: string): Promise<{ message: string; }> {
      const normalizedEmail = email?.trim().toLocaleLowerCase()
      if(!normalizedEmail){
        throw new BadRequest('Email is Required',"EMAIL_REQUIRED")
      }
      const user = await this.userRepository.findbyemail(normalizedEmail)
      const message =
            "If an account exists for this email, password reset instructions will be sent.";
     if(!user){
        return {message}
     }
     await this.otpRepository.invalidateOtp(normalizedEmail, "PASSWORD_RESET")

     const otp = await this.otpService.generateOtp()
     const codeHash = await this.otpService.hashOtp(otp)

     const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

     const otpEntity = new Otp(
        normalizedEmail,
        codeHash,
        "PASSWORD_RESET",
        expiresAt
     )

     await this.otpRepository.save(otpEntity)
     await this.emailService.sendOtp(
        normalizedEmail,
        otp
     )
     return {message}
  }

}