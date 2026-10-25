
import type { Request, Response } from "express";
import { IVerifyPasswordResetOtpUseCase } from "../../application/interfaces/IVerifyPasswordResetOtpUseCase.js";

export class VerifyPasswordResetOtpController {
    constructor(
        private readonly verifyPasswordResetOtpUseCase: IVerifyPasswordResetOtpUseCase
    ) {}

    execute = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const { email, otp } = req.body;

        const result = await this.verifyPasswordResetOtpUseCase.execute(
            email,
            otp
        );

        res.status(200).json({
            success: true,
            message: result.message,
            resetToken: result.resetToken
        });
    };
}
