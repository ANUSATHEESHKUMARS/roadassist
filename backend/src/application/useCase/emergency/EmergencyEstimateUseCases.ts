import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type {
    IEmergencyEstimateRepository,
    IEmergencyInspectionRepository,
} from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import {
    EmergencyEstimate,
    EmergencyEstimateItem,
    EstimateItemCategory,
} from "../../../domain/User/entities/EmergencyWorkflow.js";
import type { ITransactionManager } from "../../../infrastructure/databases/interface/IMongoTransactionManger.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type {
    RejectEmergencyEstimateDto,
    SubmitEmergencyEstimateDto,
} from "../../dtos/emergency/EmergencyWorkflowDtos.js";
import type {
    IApproveEmergencyEstimateUseCase,
    IRejectEmergencyEstimateUseCase,
    ISubmitEmergencyEstimateUseCase,
} from "../../interfaces/emergency/IEmergencyWorkflowUseCases.js";
import type { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";

const VALID_ITEM_CATEGORIES: EstimateItemCategory[] = [
    "part",
    "labour",
    "additional",
];

function roundCurrency(value: number): number {
    return Math.round(value * 100) / 100;
}

export class SubmitEmergencyEstimateUseCase
    implements ISubmitEmergencyEstimateUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly inspectionRepository: IEmergencyInspectionRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly transactionManager: ITransactionManager,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string,
        dto: SubmitEmergencyEstimateDto
    ): Promise<EmergencyEstimate> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        const inspectionCharge = Number(dto?.inspectionCharge);
        if (!Number.isFinite(inspectionCharge) || inspectionCharge < 0) {
            throw new BadRequest(
                "Inspection charge must be a valid non-negative amount",
                "INVALID_INSPECTION_CHARGE"
            );
        }

        if (!Array.isArray(dto?.items) || dto.items.length === 0) {
            throw new BadRequest(
                "At least one repair/labour/additional line item is required",
                "ESTIMATE_ITEMS_REQUIRED"
            );
        }

        const normalizedItems: EmergencyEstimateItem[] = dto.items.map(
            (item, idx) => {
                if (
                    !item ||
                    !VALID_ITEM_CATEGORIES.includes(item.category) ||
                    typeof item.description !== "string" ||
                    item.description.trim().length < 2
                ) {
                    throw new BadRequest(
                        `Estimate item #${idx + 1} must have a valid category and description`,
                        "INVALID_ESTIMATE_ITEM"
                    );
                }

                const quantity = Number(item.quantity);
                const unitPrice = Number(item.unitPrice);

                if (
                    !Number.isFinite(quantity) ||
                    quantity < 1 ||
                    !Number.isInteger(quantity)
                ) {
                    throw new BadRequest(
                        `Estimate item #${idx + 1} quantity must be a positive whole number`,
                        "INVALID_ITEM_QUANTITY"
                    );
                }

                if (!Number.isFinite(unitPrice) || unitPrice < 0) {
                    throw new BadRequest(
                        `Estimate item #${idx + 1} unit price cannot be negative`,
                        "INVALID_ITEM_PRICE"
                    );
                }

                return {
                    category: item.category,
                    description: item.description.trim(),
                    quantity,
                    unitPrice: roundCurrency(unitPrice),
                    totalPrice: roundCurrency(quantity * unitPrice),
                };
            }
        );

        let partsTotal = 0;
        let labourTotal = 0;
        let additionalTotal = 0;

        for (const item of normalizedItems) {
            if (item.category === "part") partsTotal += item.totalPrice;
            else if (item.category === "labour") labourTotal += item.totalPrice;
            else additionalTotal += item.totalPrice;
        }

        const roundedInspection = roundCurrency(inspectionCharge);
        partsTotal = roundCurrency(partsTotal);
        labourTotal = roundCurrency(labourTotal);
        additionalTotal = roundCurrency(additionalTotal);
        const serverTotalAmount = roundCurrency(
            roundedInspection + partsTotal + labourTotal + additionalTotal
        );

        if (serverTotalAmount <= 0) {
            throw new BadRequest(
                "Total estimate payable amount must be greater than zero",
                "INVALID_TOTAL_AMOUNT"
            );
        }

        let estimatedCompletionMinutes: number | undefined;
        if (dto.estimatedCompletionMinutes !== undefined) {
            const mins = Number(dto.estimatedCompletionMinutes);
            if (!Number.isFinite(mins) || mins < 1) {
                throw new BadRequest(
                    "Estimated completion time must be positive minutes"
                );
            }
            estimatedCompletionMinutes = Math.round(mins);
        }

        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }
        if (request.status !== "arrived") {
            throw new ConflictError(
                "Estimates can only be submitted while mechanic is on-site (arrived)"
            );
        }

        const inspection =
            await this.inspectionRepository.findByEmergencyRequestId(requestId);
        if (!inspection || inspection.status !== "completed" || !inspection.id) {
            throw new ConflictError(
                "Complete vehicle inspection before submitting an estimate",
                "INSPECTION_NOT_COMPLETED"
            );
        }

        const createdEstimate = await this.transactionManager.execute(
            async (tx) => {
                const latest =
                    await this.estimateRepository.findLatestByEmergencyRequestId(
                        requestId,
                        tx
                    );

                if (latest) {
                    if (latest.status === "submitted") {
                        throw new ConflictError(
                            "An estimate is already awaiting customer review",
                            "ESTIMATE_ALREADY_SUBMITTED"
                        );
                    }
                    if (latest.status === "approved" || latest.status === "paid") {
                        throw new ConflictError(
                            "Approved or paid estimates cannot be modified or replaced",
                            "ESTIMATE_LOCKED"
                        );
                    }
                    if (latest.status === "rejected") {
                        await this.estimateRepository.markRejectedRevisionsSuperseded(
                            requestId,
                            tx
                        );
                    }
                }

                const nextRevision = latest ? latest.revision + 1 : 1;
                const estimate = new EmergencyEstimate({
                    emergencyRequestId: requestId,
                    mechanicId,
                    customerId: request.userId,
                    inspectionId: inspection.id!,
                    revision: nextRevision,
                    inspectionCharge: roundedInspection,
                    items: normalizedItems,
                    partsTotal,
                    labourTotal,
                    additionalTotal,
                    totalAmount: serverTotalAmount,
                    ...(estimatedCompletionMinutes !== undefined
                        ? { estimatedCompletionMinutes }
                        : {}),
                    ...(typeof dto.notes === "string" && dto.notes.trim()
                        ? { notes: dto.notes.trim() }
                        : {}),
                    status: "submitted",
                    submittedAt: new Date(),
                });

                return this.estimateRepository.create(estimate, tx);
            }
        );

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_estimate_updated",
                extraPayload: { estimate: createdEstimate.toObject() },
            });
        }

        return createdEstimate;
    }
}

export class ApproveEmergencyEstimateUseCase
    implements IApproveEmergencyEstimateUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        estimateId: string,
        userId: string
    ): Promise<EmergencyEstimate> {
        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.userId !== userId) {
            throw new ForbiddenError(
                "Only the booking customer can approve this estimate"
            );
        }
        if (request.status === "cancelled" || request.status === "completed") {
            throw new ConflictError(
                "Cannot approve estimate for a closed emergency request"
            );
        }

        const latest =
            await this.estimateRepository.findLatestByEmergencyRequestId(
                requestId
            );
        if (!latest || latest.id !== estimateId) {
            throw new ConflictError(
                "Only the latest estimate revision can be approved",
                "STALE_ESTIMATE_REVISION"
            );
        }
        if (latest.status !== "submitted") {
            throw new ConflictError(
                `Cannot approve estimate in status '${latest.status}'`,
                "INVALID_ESTIMATE_STATE"
            );
        }

        const approved = await this.estimateRepository.updateStatusWithGuard(
            estimateId,
            ["submitted"],
            "approved",
            { approvedAt: new Date() }
        );
        if (!approved) {
            throw new ConflictError("Estimate approval state changed concurrently");
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_estimate_updated",
                extraPayload: { estimate: approved.toObject() },
            });
            if (request.assignedMechanicId) {
                await this.notificationService.notifyMechanicRequestUpdated(
                    request.assignedMechanicId,
                    requestId,
                    "emergency_estimate_updated",
                    { estimate: approved.toObject() }
                );
            }
        }

        return approved;
    }
}

export class RejectEmergencyEstimateUseCase
    implements IRejectEmergencyEstimateUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        estimateId: string,
        userId: string,
        dto?: RejectEmergencyEstimateDto
    ): Promise<EmergencyEstimate> {
        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.userId !== userId) {
            throw new ForbiddenError(
                "Only the booking customer can reject this estimate"
            );
        }

        const latest =
            await this.estimateRepository.findLatestByEmergencyRequestId(
                requestId
            );
        if (!latest || latest.id !== estimateId) {
            throw new ConflictError(
                "Only the latest estimate revision can be rejected",
                "STALE_ESTIMATE_REVISION"
            );
        }
        if (latest.status !== "submitted") {
            throw new ConflictError(
                `Cannot reject estimate in status '${latest.status}'`,
                "INVALID_ESTIMATE_STATE"
            );
        }

        const reason =
            typeof dto?.reason === "string" && dto.reason.trim().length > 0
                ? dto.reason.trim()
                : undefined;

        const rejected = await this.estimateRepository.updateStatusWithGuard(
            estimateId,
            ["submitted"],
            "rejected",
            {
                rejectedAt: new Date(),
                ...(reason !== undefined ? { rejectionReason: reason } : {}),
            }
        );

        if (!rejected) {
            throw new ConflictError("Estimate rejection state changed concurrently");
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_estimate_updated",
                extraPayload: { estimate: rejected.toObject() },
            });
            if (request.assignedMechanicId) {
                await this.notificationService.notifyMechanicRequestUpdated(
                    request.assignedMechanicId,
                    requestId,
                    "emergency_estimate_updated",
                    { estimate: rejected.toObject() }
                );
            }
        }

        return rejected;
    }
}

