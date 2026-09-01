import { IOtpService } from "../../application/contracts/IOtpService.js";
import { randomInt } from "node:crypto";


export class OtpService implements IOtpService{
   async generateOtp(): Promise<string> {
        const otp = randomInt(100000, 1000000)
        return otp.toString()
    }
   
}
