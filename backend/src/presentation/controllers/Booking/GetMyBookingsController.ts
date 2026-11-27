import { Request, Response } from "express";
import { BookingHistoryCategory } from "../../../application/dtos/booking/ScheduledBookingDtos.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IGetMyBookingsUseCase } from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

export class GetMyBookingsController {
    constructor(
        private readonly getMyBookingsUseCase: IGetMyBookingsUseCase
    ) {}

    getMyBookings = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const page = req.query.page ? Number(req.query.page) : undefined;
        const limit = req.query.limit ? Number(req.query.limit) : undefined;
        const category =
            typeof req.query.category === "string"
                ? (req.query.category as BookingHistoryCategory)
                : undefined;

        const result = await this.getMyBookingsUseCase.execute(userId, {
            ...(page !== undefined ? { page } : {}),
            ...(limit !== undefined ? { limit } : {}),
            ...(category !== undefined ? { category } : {}),
        });

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Customer bookings retrieved successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}

