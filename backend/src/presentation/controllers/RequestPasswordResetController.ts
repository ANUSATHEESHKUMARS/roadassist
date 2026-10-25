
import type { Request, Response } from "express";
import { IRequestPasswordResetUseCase } from "../../application/interfaces/IRequestPasswordResetUseCase.js";

export class RequestPasswordResetController {
    constructor(
        private readonly requestPasswordResetUseCase: IRequestPasswordResetUseCase
    ) {}

    execute = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const { email } = req.body;

        const result = await this.requestPasswordResetUseCase.execute(email);

        res.status(200).json({
            success: true,
            message: result.message
        });
    };
}
