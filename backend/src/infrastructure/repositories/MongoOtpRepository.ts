import { Otp, OtpPurpose } from "../../domain/User/entities/Otp.js";
import { IOtpRepository } from "../../domain/User/repositories/IOtpRepository.js";
import { OtpModel } from "../databases/models/OtpModel.js";

export class MongoOtpRepository implements IOtpRepository {

    async save(otp: Otp): Promise<void> {
        await OtpModel.create({
            userId: otp.userId,
            email: otp.email,
            codeHash: otp.codeHash,
            purpose: otp.purpose,
            expiresAt: otp.expiresAt,
            attempts: otp.attempts,
            used: otp.used,
            createdAt: otp.createdAt

        })
    }
    async findByEmailAndPurpose(email: string, purpose: OtpPurpose): Promise<Otp | null> {
        const otpDocument = await OtpModel.findOne({ email, purpose})
        if (!otpDocument) {
            return null
        }
        return new Otp(otpDocument.userId.toString(),
            otpDocument.email,
            otpDocument.codeHash,
            otpDocument.purpose,
            otpDocument.expiresAt,
            otpDocument.attempts,
            otpDocument.used,
            otpDocument.createdAt)
    }
    async incrementAttemps(email: string, purpose: OtpPurpose): Promise<void> {
        await OtpModel.updateOne({email, purpose,used : false},{$inc : {attempts:1} })
    }
    async markAsUsed(email: string, purpose: OtpPurpose): Promise<void> {
        await OtpModel.updateOne({email , purpose , used : false} , {$set : {used : true} })
    }

}


