
import type { Request, Response } from "express";
import { IResetPasswordUseCase } from "../../application/interfaces/IResetPasswordUseCase.js";

export class ResetPasswordController {
    constructor(
        private readonly resetPasswordUseCase: IResetPasswordUseCase
    ) {}

    execute = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const { resetToken, newPassword } = req.body;

        const result = await this.resetPasswordUseCase.execute(
            resetToken,
            newPassword
        );

        res.status(200).json({
            success: true,
            message: result.message
        });
    };
}
