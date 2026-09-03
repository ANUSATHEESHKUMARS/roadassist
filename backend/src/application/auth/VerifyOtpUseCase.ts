import { IOtpRepository } from "../../domain/User/repositories/IOtpRepository.js";
import { BadRequest } from "../../shared/errors/BadRequestError.js";
import { NotfoundError } from "../../shared/errors/NotFoundError.js";
import { IOtpService } from "../contracts/IOtpService.js";
import { IVerifyOtpUseCase } from "../interfaces/IVerifyOtp.js";
import { otpDto } from "../dtos/otp.js";


export class VerifyOtpUseCase implements IVerifyOtpUseCase {
    constructor(private otpRepository: IOtpRepository, private otpService: IOtpService) { }
    async verify(verifyotpDto : otpDto): Promise<{ message: string; }> {
        const otpRecord = await this.otpRepository.findByEmailAndPurpose(verifyotpDto.email, verifyotpDto.purpose)
        if(!otpRecord){
            throw new NotfoundError("Otp not found..","OTP_NOT_FOUND")
        }
        if(otpRecord.expiresAt < new Date()){
            throw new BadRequest("otp time out" , "OTP_TIME_OUT")
        }
        if(otpRecord.used){
            throw new BadRequest("otp has alredy been used","OTP_ALREADY_USED")
        }
        if(otpRecord.attempts >= 5){
            throw new BadRequest("Too many attempts","TO_MANY_ATTEMPTS")
        }
        const isValid = await this.otpService.compareOtp(verifyotpDto.otp ,otpRecord.codeHash )
        if(!isValid){
            await this.otpRepository.incrementAttemps(verifyotpDto.email , verifyotpDto.purpose)
            throw new BadRequest("Invalid otp" , "INVALID_OTP")
        }
        await this.otpRepository.markAsUsed(verifyotpDto.email , verifyotpDto.purpose)
console.log('succes aayi monee')
        return { message : "OTP verification succesfull"}
    }
}


