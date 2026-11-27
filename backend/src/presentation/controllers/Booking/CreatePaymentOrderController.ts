import { Request, Response } from "express";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { ICreatePaymentOrderUseCase } from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

export class CreatePaymentOrderController {
    constructor(
        private readonly createPaymentOrderUseCase: ICreatePaymentOrderUseCase
    ) {}

    createOrder = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId =
            typeof req.params.bookingId === "string"
                ? req.params.bookingId
                : req.body?.bookingId;

        const order = await this.createPaymentOrderUseCase.execute(userId, {
            bookingId,
        });

        const response: CommonResponse<typeof order> = {
            success: true,
            message: "Razorpay payment order created successfully",
            data: order,
        };

        res.status(HttpStatusCode.CREATED).json(response);
    };
}

