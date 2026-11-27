import { Request, Response } from "express";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import {
    IGetBookingDetailsUseCase,
    IGetBookingStatusUseCase,
} from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

export class BookingStatusController {
    constructor(
        private readonly getBookingStatusUseCase: IGetBookingStatusUseCase,
        private readonly getBookingDetailsUseCase: IGetBookingDetailsUseCase
    ) {}

    getStatus = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId = String(req.params.bookingId ?? "");
        const result = await this.getBookingStatusUseCase.execute(
            userId,
            bookingId
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Booking status retrieved successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    getDetails = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId = String(req.params.bookingId ?? "");
        const result = await this.getBookingDetailsUseCase.execute(
            userId,
            bookingId
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Booking details retrieved successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}

