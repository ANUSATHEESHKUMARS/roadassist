import type {
    CompleteEmergencyInspectionDto,
    CompleteRepairDto,
    CreateEmergencyPaymentOrderResponseDto,
    EmergencyServiceReportDto,
    RejectEmergencyEstimateDto,
    SubmitEmergencyEstimateDto,
    UpdateRepairProgressDto,
    VerifyEmergencyPaymentDto,
    VerifyEmergencyPaymentResponseDto,
} from "../../dtos/emergency/EmergencyWorkflowDtos.js";
import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import type {
    EmergencyEstimate,
    EmergencyInspection,
    EmergencyRepair,
} from "../../../domain/User/entities/EmergencyWorkflow.js";

export interface ICancelEmergencyRequestUseCase {
    execute(
        requestId: string,
        userId: string,
        reason?: string
    ): Promise<EmergencyRequest>;
}

export interface IStartEmergencyInspectionUseCase {
    execute(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyInspection>;
}

export interface ICompleteEmergencyInspectionUseCase {
    execute(
        requestId: string,
        mechanicId: string,
        dto: CompleteEmergencyInspectionDto
    ): Promise<EmergencyInspection>;
}

export interface ISubmitEmergencyEstimateUseCase {
    execute(
        requestId: string,
        mechanicId: string,
        dto: SubmitEmergencyEstimateDto
    ): Promise<EmergencyEstimate>;
}

export interface IApproveEmergencyEstimateUseCase {
    execute(
        requestId: string,
        estimateId: string,
        userId: string
    ): Promise<EmergencyEstimate>;
}

export interface IRejectEmergencyEstimateUseCase {
    execute(
        requestId: string,
        estimateId: string,
        userId: string,
        dto?: RejectEmergencyEstimateDto
    ): Promise<EmergencyEstimate>;
}

export interface ICreateEmergencyPaymentOrderUseCase {
    execute(
        requestId: string,
        userId: string
    ): Promise<CreateEmergencyPaymentOrderResponseDto>;
}

export interface IVerifyEmergencyPaymentUseCase {
    execute(
        requestId: string,
        userId: string,
        dto: VerifyEmergencyPaymentDto
    ): Promise<VerifyEmergencyPaymentResponseDto>;
}

export interface IStartEmergencyRepairUseCase {
    execute(requestId: string, mechanicId: string): Promise<EmergencyRepair>;
}

export interface IUpdateEmergencyRepairProgressUseCase {
    execute(
        requestId: string,
        mechanicId: string,
        dto: UpdateRepairProgressDto
    ): Promise<EmergencyRepair>;
}

export interface ICompleteEmergencyRepairUseCase {
    execute(
        requestId: string,
        mechanicId: string,
        dto: CompleteRepairDto
    ): Promise<{ request: EmergencyRequest; repair: EmergencyRepair }>;
}

export interface IGetEmergencyServiceReportUseCase {
    execute(
        requestId: string,
        requesterId: string
    ): Promise<EmergencyServiceReportDto>;
}

