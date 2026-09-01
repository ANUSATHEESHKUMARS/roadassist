import { Otp } from "../../domain/User/entities/Otp.js";
import { IOtpRepository } from "../../domain/User/repositories/IOtpRepository.js";
import { OtpModel } from "../databases/models/OtpModel.js";

export class MongoOtpRepository implements IOtpRepository{
   
   async save(otp: Otp): Promise<void> {
        await OtpModel.create({
            userId : otp.userId,
            email : otp.email,
            codeHash : otp.codeHash,
            purpose : otp.purpose,
            expiresAt :otp.expiresAt,
            attempts:otp.attempts,
            used:otp.used,
            createdAt:otp.createdAt

        })
    }
  
}