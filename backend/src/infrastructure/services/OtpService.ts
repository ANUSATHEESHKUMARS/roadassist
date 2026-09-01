import { IOtpService } from "../../application/contracts/IOtpService.js";
import { randomInt } from "node:crypto";
import bcrypt from 'bcrypt'

export class OtpService implements IOtpService{
   async generateOtp(): Promise<string> {
        const otp = randomInt(100000, 1000000)
        return otp.toString()
    }
   async hashOtp(otp: string): Promise<string> {
       const saltRounds = 10
       return await bcrypt.hash(otp , saltRounds)
   }
   async compareOtp(otp: string, hashed: string): Promise<boolean> {
       return await bcrypt.compare(otp , hashed)
   }
}
