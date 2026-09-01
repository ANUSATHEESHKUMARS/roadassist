import { Otp } from "../../domain/User/entities/Otp.js";
import { IOtpRepository } from "../../domain/User/repositories/IOtpRepository.js";
import { OtpModel } from "../databases/models/OtpMode.js";

export class MongoOtpRepository implements IOtpRepository{
   
   async save(otp: Otp): Promise<void> {
        await OtpModel.create({
            userId : otp.userId,
            codeHash : otp.codeHash,
            expiresAt :otp.expiresAt,
            attempts:otp.attempts,
            used:otp.used,
            createdAt:otp.createdAt

        })
    }
  
}