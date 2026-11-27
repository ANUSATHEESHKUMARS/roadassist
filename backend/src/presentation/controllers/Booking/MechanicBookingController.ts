import { Request, Response } from "express";
import {
    GetMechanicBookingsQueryDto,
    MechanicBookingFilterTab,
    MechanicBookingSort,
} from "../../../application/dtos/booking/ScheduledBookingDtos.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import {
    ICompleteMechanicBookingUseCase,
    IGetBookingDetailsUseCase,
    IGetMechanicBookingsUseCase,
    IStartMechanicBookingUseCase,
} from "../../../application/interfaces/booking/IScheduledBookingUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";

function extractSingleParam(param: string | string[] | undefined): string {
    return (Array.isArray(param) ? param[0] : param) ?? "";
}

function extractSingleQuery(value: unknown): string | undefined {
    if (typeof value === "string") {
        return value;
    }
    if (Array.isArray(value) && typeof value[0] === "string") {
        return value[0];
    }
    return undefined;
}

export class MechanicBookingController {
    constructor(
        private readonly getMechanicBookingsUseCase: IGetMechanicBookingsUseCase,
        private readonly getBookingDetailsUseCase: IGetBookingDetailsUseCase,
        private readonly startMechanicBookingUseCase: IStartMechanicBookingUseCase,
        private readonly completeMechanicBookingUseCase: ICompleteMechanicBookingUseCase
    ) {}

    getBookings = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const pageStr = extractSingleQuery(req.query.page);
        const limitStr = extractSingleQuery(req.query.limit);
        const filterStr = extractSingleQuery(req.query.filter);
        const searchStr = extractSingleQuery(req.query.search);
        const dateStr = extractSingleQuery(req.query.date);
        const serviceTypeStr = extractSingleQuery(req.query.serviceType);
        const sortStr = extractSingleQuery(req.query.sort);

        const query: GetMechanicBookingsQueryDto = {
            ...(pageStr !== undefined ? { page: Number(pageStr) } : {}),
            ...(limitStr !== undefined ? { limit: Number(limitStr) } : {}),
            ...(filterStr !== undefined
                ? { filter: filterStr as MechanicBookingFilterTab }
                : {}),
            ...(searchStr !== undefined ? { search: searchStr } : {}),
            ...(dateStr !== undefined ? { date: dateStr } : {}),
            ...(serviceTypeStr !== undefined
                ? { serviceType: serviceTypeStr }
                : {}),
            ...(sortStr !== undefined
                ? { sort: sortStr as MechanicBookingSort }
                : {}),
        };

        const result = await this.getMechanicBookingsUseCase.execute(
            mechanicId,
            query
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Mechanic bookings retrieved successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    getBookingDetails = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId = extractSingleParam(req.params.bookingId);
        const details = await this.getBookingDetailsUseCase.execute(
            mechanicId,
            bookingId,
            "mechanic"
        );

        const response: CommonResponse<typeof details> = {
            success: true,
            message: "Mechanic booking details retrieved successfully",
            data: details,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    startService = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId = extractSingleParam(req.params.bookingId);
        const result = await this.startMechanicBookingUseCase.execute(
            mechanicId,
            bookingId
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Service started successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    completeService = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }

        const bookingId = extractSingleParam(req.params.bookingId);
        const result = await this.completeMechanicBookingUseCase.execute(
            mechanicId,
            bookingId
        );

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Service completed successfully",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}

