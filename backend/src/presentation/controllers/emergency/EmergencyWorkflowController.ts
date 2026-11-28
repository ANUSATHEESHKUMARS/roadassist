import type { Request, Response } from "express";
import { getWebRtcIceServers } from "../../../application/constants/emergencyConfig.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import type {
    IApproveEmergencyEstimateUseCase,
    ICancelEmergencyRequestUseCase,
    ICompleteEmergencyInspectionUseCase,
    ICompleteEmergencyRepairUseCase,
    ICreateEmergencyPaymentOrderUseCase,
    IGetEmergencyServiceReportUseCase,
    IRejectEmergencyEstimateUseCase,
    IStartEmergencyInspectionUseCase,
    IStartEmergencyRepairUseCase,
    ISubmitEmergencyEstimateUseCase,
    IUpdateEmergencyRepairProgressUseCase,
    IVerifyEmergencyPaymentUseCase,
} from "../../../application/interfaces/emergency/IEmergencyWorkflowUseCases.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import type { CommonResponse } from "../../../shared/types/CommonResponse.js";

function extractParam(value: string | string[] | undefined): string {
    return (Array.isArray(value) ? value[0] : value) ?? "";
}

export class EmergencyWorkflowController {
    constructor(
        private readonly cancelEmergencyRequestUseCase: ICancelEmergencyRequestUseCase,
        private readonly startInspectionUseCase: IStartEmergencyInspectionUseCase,
        private readonly completeInspectionUseCase: ICompleteEmergencyInspectionUseCase,
        private readonly submitEstimateUseCase: ISubmitEmergencyEstimateUseCase,
        private readonly approveEstimateUseCase: IApproveEmergencyEstimateUseCase,
        private readonly rejectEstimateUseCase: IRejectEmergencyEstimateUseCase,
        private readonly createEmergencyPaymentOrderUseCase: ICreateEmergencyPaymentOrderUseCase,
        private readonly verifyEmergencyPaymentUseCase: IVerifyEmergencyPaymentUseCase,
        private readonly startRepairUseCase: IStartEmergencyRepairUseCase,
        private readonly updateRepairProgressUseCase: IUpdateEmergencyRepairProgressUseCase,
        private readonly completeRepairUseCase: ICompleteEmergencyRepairUseCase,
        private readonly getEmergencyServiceReportUseCase: IGetEmergencyServiceReportUseCase
    ) {}

    getRtcConfig = async (req: Request, res: Response): Promise<void> => {
        if (!req.user?.userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const config = getWebRtcIceServers();
        const response: CommonResponse<typeof config> = {
            success: true,
            message: "WebRTC ICE configuration retrieved",
            data: config,
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    cancelRequest = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const reason =
            typeof req.body?.reason === "string" ? req.body.reason : undefined;

        const cancelled = await this.cancelEmergencyRequestUseCase.execute(
            requestId,
            userId,
            reason
        );

        const response: CommonResponse<typeof cancelled> = {
            success: true,
            message: "Emergency request cancelled successfully",
            data: cancelled,
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    startInspection = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const inspection = await this.startInspectionUseCase.execute(
            requestId,
            mechanicId
        );

        const response: CommonResponse<ReturnType<typeof inspection.toObject>> =
            {
                success: true,
                message: "Vehicle inspection started",
                data: inspection.toObject(),
            };
        res.status(HttpStatusCode.OK).json(response);
    };

    completeInspection = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const inspection = await this.completeInspectionUseCase.execute(
            requestId,
            mechanicId,
            req.body
        );

        const response: CommonResponse<ReturnType<typeof inspection.toObject>> =
            {
                success: true,
                message: "Vehicle inspection completed",
                data: inspection.toObject(),
            };
        res.status(HttpStatusCode.OK).json(response);
    };

    submitEstimate = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const estimate = await this.submitEstimateUseCase.execute(
            requestId,
            mechanicId,
            req.body
        );

        const response: CommonResponse<ReturnType<typeof estimate.toObject>> = {
            success: true,
            message: "Service estimate submitted for customer approval",
            data: estimate.toObject(),
        };
        res.status(HttpStatusCode.CREATED).json(response);
    };

    approveEstimate = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const estimateId = extractParam(req.params.estimateId);
        const approved = await this.approveEstimateUseCase.execute(
            requestId,
            estimateId,
            userId
        );

        const response: CommonResponse<ReturnType<typeof approved.toObject>> = {
            success: true,
            message: "Estimate approved. Proceed with payment.",
            data: approved.toObject(),
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    rejectEstimate = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const estimateId = extractParam(req.params.estimateId);
        const rejected = await this.rejectEstimateUseCase.execute(
            requestId,
            estimateId,
            userId,
            req.body
        );

        const response: CommonResponse<ReturnType<typeof rejected.toObject>> = {
            success: true,
            message: "Estimate rejected. Mechanic may revise and resubmit.",
            data: rejected.toObject(),
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    createPaymentOrder = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const order = await this.createEmergencyPaymentOrderUseCase.execute(
            requestId,
            userId
        );

        const response: CommonResponse<typeof order> = {
            success: true,
            message: "Emergency Razorpay payment order created",
            data: order,
        };
        res.status(HttpStatusCode.CREATED).json(response);
    };

    verifyPayment = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;
        if (!userId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const verified = await this.verifyEmergencyPaymentUseCase.execute(
            requestId,
            userId,
            req.body
        );

        const response: CommonResponse<typeof verified> = {
            success: true,
            message: "Emergency payment verified successfully",
            data: verified,
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    startRepair = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const repair = await this.startRepairUseCase.execute(
            requestId,
            mechanicId
        );

        const response: CommonResponse<ReturnType<typeof repair.toObject>> = {
            success: true,
            message: "Repair started successfully",
            data: repair.toObject(),
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    logRepairProgress = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const repair = await this.updateRepairProgressUseCase.execute(
            requestId,
            mechanicId,
            req.body
        );

        const response: CommonResponse<ReturnType<typeof repair.toObject>> = {
            success: true,
            message: "Repair progress logged",
            data: repair.toObject(),
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    completeRepair = async (req: Request, res: Response): Promise<void> => {
        const mechanicId = req.user?.userId;
        if (!mechanicId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const result = await this.completeRepairUseCase.execute(
            requestId,
            mechanicId,
            req.body
        );

        const response: CommonResponse<{
            request: typeof result.request;
            repair: ReturnType<typeof result.repair.toObject>;
        }> = {
            success: true,
            message: "Repair completed successfully",
            data: {
                request: result.request,
                repair: result.repair.toObject(),
            },
        };
        res.status(HttpStatusCode.OK).json(response);
    };

    getServiceReport = async (req: Request, res: Response): Promise<void> => {
        const requesterId = req.user?.userId;
        if (!requesterId) {
            throw new UnauthorizedError("Unauthorized, please log in.");
        }
        const requestId = extractParam(req.params.id);
        const report = await this.getEmergencyServiceReportUseCase.execute(
            requestId,
            requesterId
        );

        const response: CommonResponse<typeof report> = {
            success: true,
            message: "Emergency service report retrieved successfully",
            data: report,
        };
        res.status(HttpStatusCode.OK).json(response);
    };
}

