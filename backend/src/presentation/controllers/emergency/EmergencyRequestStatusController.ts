import { Request, Response } from "express";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IGetEmergencyRequestStatusUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";
import { IGetUserEmergencyRequestsUseCase } from "../../../application/interfaces/IMechanicEmergencyUseCases.js";
import { IGetActiveEmergencyRequestUseCase } from "../../../application/interfaces/IGetActiveEmergencyRequestUseCase.js";


export class EmergencyRequestStatusController {
    constructor(
        private readonly getEmergencyRequestStatusUseCase: IGetEmergencyRequestStatusUseCase,
        private readonly getUserEmergencyRequestsUseCase: IGetUserEmergencyRequestsUseCase,
        private readonly getActiveEmergencyRequestUseCase:IGetActiveEmergencyRequestUseCase
    ) { }

    getRequestStatus = async (req: Request, res: Response): Promise<void> => {
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

        const result = await this.getEmergencyRequestStatusUseCase.execute(id, userId);

        const response: CommonResponse<typeof result> = {
            success: true,
            message: "Emergency request status retrieved",
            data: result,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    getUserRequests = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized, please log in.",
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const requests = await this.getUserEmergencyRequestsUseCase.execute(userId);

        const response: CommonResponse<typeof requests> = {
            success: true,
            message: `Found ${requests.length} emergency requests`,
            data: requests,
        };

        res.status(HttpStatusCode.OK).json(response);
    };

    getActiveRequest = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    if (!userId) {
        const response: CommonResponse = {
            success: false,
            message: "Unauthorized, please log in.",
        };

        res.status(HttpStatusCode.UNAUTHORIZED).json(response);
        return;
    }

    const activeRequest =
        await this.getActiveEmergencyRequestUseCase.execute(userId);

    const response: CommonResponse<typeof activeRequest> = {
        success: true,
        message: activeRequest
            ? "Active emergency request retrieved"
            : "No active emergency request found",
        data: activeRequest,
    };

    res.status(HttpStatusCode.OK).json(response);
};
}

