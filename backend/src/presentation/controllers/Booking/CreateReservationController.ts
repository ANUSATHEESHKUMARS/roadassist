import { Request, Response } from "express";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { ICreateBookingReservationUseCase } from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

export class CreateReservationController {
    constructor(
        private readonly createBookingReservationUseCase: ICreateBookingReservationUseCase
    ) {}

    createReservation = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const reservation = await this.createBookingReservationUseCase.execute(
            userId,
            req.body
        );

        const response: CommonResponse<typeof reservation> = {
            success: true,
            message: "Booking slot reserved successfully",
            data: reservation,
        };

        res.status(HttpStatusCode.CREATED).json(response);
    };
}

