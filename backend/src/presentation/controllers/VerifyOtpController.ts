import { Request, Response } from "express";
import { IVerifyOtpController } from "../interfaces/IVerifyOtpController.js";
import { IVerifyOtpUseCase } from "../../application/interfaces/IVerifyOtp.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { otpDto } from "../../application/dtos/otp.js";


export class VerifyOtpController implements IVerifyOtpController {
    constructor(private verifyuseCase: IVerifyOtpUseCase) { }
     execute = async (req: Request, res: Response): Promise<void> => {

        const otpDto: otpDto = req.body
        console.log(otpDto)
        const result = await this.verifyuseCase.verify(otpDto)
        res.status(HttpStatusCode.OK).json({
            succes: true,
            message: result.message
        })
    }
}