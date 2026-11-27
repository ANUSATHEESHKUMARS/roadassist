import { Request, Response } from "express";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IVerifyPaymentUseCase } from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

export class VerifyPaymentController {
    constructor(
        private readonly verifyPaymentUseCase: IVerifyPaymentUseCase
    ) {}

    verify = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId =
            typeof req.params.bookingId === "string"
                ? req.params.bookingId
                : req.body?.bookingId;

        const result = await this.verifyPaymentUseCase.execute(userId, {
            bookingId,
            razorpayOrderId: req.body?.razorpayOrderId,
            razorpayPaymentId: req.body?.razorpayPaymentId,
            razorpaySignature: req.body?.razorpaySignature,
        });

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Payment verified and booking confirmed",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}

