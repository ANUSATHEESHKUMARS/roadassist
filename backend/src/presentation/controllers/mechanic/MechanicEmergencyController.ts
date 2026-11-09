import { Request, Response } from "express";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IUpdateMechanicAvailabilityUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";
import { IGetNearbyEmergencyRequestsUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";
import { IAcceptEmergencyRequestUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";
import { IRejectEmergencyRequestUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";
import { IGetMechanicAssignedRequestUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";

export class MechanicEmergencyController {
    constructor(
        private readonly updateMechanicAvailabilityUseCase: IUpdateMechanicAvailabilityUseCase,
        private readonly getNearbyEmergencyRequestsUseCase: IGetNearbyEmergencyRequestsUseCase,
        private readonly acceptEmergencyRequestUseCase: IAcceptEmergencyRequestUseCase,
        private readonly rejectEmergencyRequestUseCase: IRejectEmergencyRequestUseCase,
        private readonly getMechanicAssignedRequestUseCase: IGetMechanicAssignedRequestUseCase
    ) {}

    updateAvailability = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in.",
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const { isAvailable, latitude, longitude } = req.body;

        const availability = await this.updateMechanicAvailabilityUseCase.execute(
            userId,
            isAvailable,
            latitude,
            longitude
        );

        const response: CommonResponse<typeof availability> = {
            success: true,
            message: isAvailable
                ? "You are now online and visible to nearby customers"
                : "You are now offline",
            data: availability,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    getNearbyRequests = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in.",
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const requests = await this.getNearbyEmergencyRequestsUseCase.execute(userId);

        const response: CommonResponse<typeof requests> = {
            success: true,
            message: `Found ${requests.length} nearby emergency requests`,
            data: requests,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    acceptRequest = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in.",
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            const response: CommonResponse = {
                success: false,
                message: "Invalid emergency request ID",
            };

            res.status(HttpStatusCode.BAD_REQUEST).json(response);
            return;
        }
        const accepted = await this.acceptEmergencyRequestUseCase.execute(id, userId);

        const response: CommonResponse<typeof accepted> = {
            success: true,
            message: "Emergency request accepted successfully",
            data: accepted,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    rejectRequest = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in.",
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            const response: CommonResponse = {
                success: false,
                message: "Invalid emergency request ID",
            };

            res.status(HttpStatusCode.BAD_REQUEST).json(response);
            return;
        }

        const rejected = await this.rejectEmergencyRequestUseCase.execute(id, userId);

        const response: CommonResponse<typeof rejected> = {
            success: true,
            message: "Emergency request rejected",
            data: rejected,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    getAssignedRequest = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in.",
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            const response: CommonResponse = {
                success: false,
                message: "Invalid emergency request ID",
            };
            res.status(HttpStatusCode.BAD_REQUEST).json(response);
            return;
        }

        const result = await this.getMechanicAssignedRequestUseCase.execute(id, userId);

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Assigned request details retrieved",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };
}
