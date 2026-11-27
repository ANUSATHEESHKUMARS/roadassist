import { Request, Response } from "express";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IDiscoverAvailableMechanicsUseCase } from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { BookingSlot } from "../../../domain/User/Types/BookingTypes.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

export class DiscoverMechanicsController {
    constructor(
        private readonly discoverAvailableMechanicsUseCase: IDiscoverAvailableMechanicsUseCase
    ) {}

    discover = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const source =
            req.method === "GET" ? req.query : req.body;

        const rawServiceMode = source.serviceMode;
        const serviceMode =
            rawServiceMode === "mobile" || rawServiceMode === "workshop"
                ? rawServiceMode
                : undefined;

        const result = await this.discoverAvailableMechanicsUseCase.execute(
            userId,
            {
                scheduledDate: String(source.scheduledDate ?? ""),
                slot: String(source.slot ?? "") as BookingSlot,
                vehicleId: String(source.vehicleId ?? ""),
                serviceType: String(source.serviceType ?? ""),
                latitude: Number(source.latitude),
                longitude: Number(source.longitude),
                ...(serviceMode !== undefined ? { serviceMode } : {}),
            }
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Available mechanics retrieved successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}

