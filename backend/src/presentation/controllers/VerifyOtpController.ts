import { Request, Response } from "express";
import { IVerifyOtpController } from "../interfaces/IVerifyOtpController.js";
import { IVerifyOtpUseCase } from "../../application/interfaces/IVerifyOtp.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { otpDto } from "../../application/dtos/otp.js";
import { ICookieService } from "../../application/contracts/ICookieService.js";

export class VerifyOtpController implements IVerifyOtpController {
    constructor(private verifyuseCase: IVerifyOtpUseCase,
        private cookieService: ICookieService) { }

    execute = async (req: Request, res: Response): Promise<void> => {
        const otpDto: otpDto = req.body
        const result = await this.verifyuseCase.verify(otpDto)
        console.log("TOKENS:", result);
        this.cookieService.setCookie( res, "accessToken", result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        })

        this.cookieService.setCookie(
           res,
            "refreshToken",
            result.refreshToken,
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            }
        );
        res.status(HttpStatusCode.OK).json({
            succes: true,
            message: result.message,

        })
    }
}