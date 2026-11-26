
import { Request, Response } from "express";

import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { ICreateSlotBookingUseCase } from "../../../application/interfaces/ICreateSlotBookingUseCase.js";


export class BookingController {

    constructor(
        private readonly createSlotBookingUseCase: ICreateSlotBookingUseCase
    ) {}

    createBooking = async (
        req: Request,
        res: Response
    ): Promise<void> => {

        const userId = req.user?.userId;

        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in."
            };

            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const booking =
            await this.createSlotBookingUseCase.execute(
                userId,
                req.body
            );

        const response: CommonResponse<typeof booking> = {
            success: true,
            message: "Scheduled booking created successfully",
            data: booking
        };

        res.status(HttpStatusCode.CREATED).json(response);
    };
}
