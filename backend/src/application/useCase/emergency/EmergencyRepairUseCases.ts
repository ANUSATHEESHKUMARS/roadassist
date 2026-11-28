import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type {
    IEmergencyEstimateRepository,
    IEmergencyInspectionRepository,
    IEmergencyPaymentRepository,
    IEmergencyRepairRepository,
} from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import type { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import {
    EmergencyRepair,
    RepairPartUsed,
} from "../../../domain/User/entities/EmergencyWorkflow.js";
import type { ITransactionManager } from "../../../infrastructure/databases/interface/IMongoTransactionManger.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type {
    CompleteRepairDto,
    UpdateRepairProgressDto,
} from "../../dtos/emergency/EmergencyWorkflowDtos.js";
import type {
    ICompleteEmergencyRepairUseCase,
    IStartEmergencyRepairUseCase,
    IUpdateEmergencyRepairProgressUseCase,
} from "../../interfaces/emergency/IEmergencyWorkflowUseCases.js";
import type { IMechanicLocationStore } from "../../interfaces/mechanic/IMechanicLocationStore.js";
import type { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";

export class StartEmergencyRepairUseCase
    implements IStartEmergencyRepairUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly inspectionRepository: IEmergencyInspectionRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly emergencyPaymentRepository: IEmergencyPaymentRepository,
        private readonly repairRepository: IEmergencyRepairRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyRepair> {
        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }
        if (request.status !== "arrived") {
            throw new ConflictError(
                "Repair can only start while mechanic is arrived on site",
                "INVALID_REQUEST_STATUS"
            );
        }

        const [inspection, latestEstimate, payment, existingRepair] =
            await Promise.all([
                this.inspectionRepository.findByEmergencyRequestId(requestId),
                this.estimateRepository.findLatestByEmergencyRequestId(requestId),
                this.emergencyPaymentRepository.findLatestByEmergencyRequestId(
                    requestId
                ),
                this.repairRepository.findByEmergencyRequestId(requestId),
            ]);

        if (!inspection || inspection.status !== "completed") {
            throw new ConflictError("Vehicle inspection must be completed first");
        }

        if (!latestEstimate || !latestEstimate.id) {
            throw new ConflictError("Estimate has not been created yet");
        }

        if (latestEstimate.status !== "paid") {
            throw new ConflictError(
                "Customer payment for the approved estimate is required before starting repair",
                "PAYMENT_REQUIRED_BEFORE_REPAIR"
            );
        }

        if (
            !payment ||
            payment.estimateId !== latestEstimate.id ||
            payment.status !== "paid"
        ) {
            throw new ConflictError(
                "Verified customer payment is required before starting repair",
                "PAYMENT_NOT_VERIFIED"
            );
        }

        const now = new Date();
        let repair: EmergencyRepair;

        if (!existingRepair) {
            repair = await this.repairRepository.create(
                new EmergencyRepair({
                    emergencyRequestId: requestId,
                    mechanicId,
                    estimateId: latestEstimate.id,
                    status: "in_progress",
                    progressLogs: [
                        { note: "Repair work started", loggedAt: now },
                    ],
                    partsUsed: [],
                    startedAt: now,
                })
            );
        } else if (existingRepair.status === "pending") {
            const updated = await this.repairRepository.updateStatusWithGuard(
                requestId,
                mechanicId,
                ["pending"],
                "in_progress",
                { startedAt: now }
            );
            if (!updated) {
                throw new ConflictError("Unable to start repair");
            }
            repair = updated;
        } else if (existingRepair.status === "in_progress") {
            throw new ConflictError(
                "Repair is already in progress",
                "REPAIR_ALREADY_STARTED"
            );
        } else {
            throw new ConflictError(
                "Repair has already been completed",
                "REPAIR_ALREADY_COMPLETED"
            );
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_repair_updated",
                extraPayload: { repair: repair.toObject() },
            });
        }

        return repair;
    }
}

export class UpdateEmergencyRepairProgressUseCase
    implements IUpdateEmergencyRepairProgressUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly repairRepository: IEmergencyRepairRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string,
        dto: UpdateRepairProgressDto
    ): Promise<EmergencyRepair> {
        if (!dto || typeof dto.note !== "string" || dto.note.trim().length < 2) {
            throw new BadRequest("Progress note must be at least 2 characters");
        }

        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }

        const updated = await this.repairRepository.appendProgressLog(
            requestId,
            mechanicId,
            {
                note: dto.note.trim(),
                loggedAt: new Date(),
            }
        );

        if (!updated) {
            throw new ConflictError(
                "Repair must be in progress to log updates",
                "REPAIR_NOT_IN_PROGRESS"
            );
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_repair_updated",
                extraPayload: { repair: updated.toObject() },
            });
        }

        return updated;
    }
}

export class CompleteEmergencyRepairUseCase
    implements ICompleteEmergencyRepairUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly repairRepository: IEmergencyRepairRepository,
        private readonly transactionManager: ITransactionManager,
        private readonly locationStore?: IMechanicLocationStore,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string,
        dto: CompleteRepairDto
    ): Promise<{ request: EmergencyRequest; repair: EmergencyRepair }> {
        if (
            !dto ||
            typeof dto.workPerformed !== "string" ||
            dto.workPerformed.trim().length < 5
        ) {
            throw new BadRequest(
                "Describe the repair work performed (at least 5 characters)",
                "WORK_PERFORMED_REQUIRED"
            );
        }

        const sanitizedParts: RepairPartUsed[] = Array.isArray(dto.partsUsed)
            ? dto.partsUsed.map((part, idx) => {
                  if (
                      !part ||
                      typeof part.name !== "string" ||
                      part.name.trim().length < 2
                  ) {
                      throw new BadRequest(
                          `Part #${idx + 1} requires a valid name`
                      );
                  }
                  const qty = Number(part.quantity ?? 1);
                  if (!Number.isFinite(qty) || qty < 1 || !Number.isInteger(qty)) {
                      throw new BadRequest(
                          `Part #${idx + 1} quantity must be a positive integer`
                      );
                  }
                  return {
                      name: part.name.trim(),
                      quantity: qty,
                      ...(typeof part.notes === "string" && part.notes.trim()
                          ? { notes: part.notes.trim() }
                          : {}),
                  };
              })
            : [];

        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }
        if (request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }
        if (request.status === "completed") {
            throw new ConflictError(
                "Emergency request is already completed",
                "REQUEST_ALREADY_COMPLETED"
            );
        }
        if (request.status !== "arrived") {
            throw new ConflictError(
                "Repair can only be completed when mechanic is on-site"
            );
        }

        const now = new Date();
        const result = await this.transactionManager.execute(async (tx) => {
            const completedRepair =
                await this.repairRepository.updateStatusWithGuard(
                    requestId,
                    mechanicId,
                    ["in_progress"],
                    "completed",
                    {
                        workPerformed: dto.workPerformed.trim(),
                        partsUsed: sanitizedParts,
                        completedAt: now,
                    },
                    tx
                );

            if (!completedRepair) {
                throw new ConflictError(
                    "Repair must be started (in_progress) before it can be completed",
                    "REPAIR_NOT_IN_PROGRESS"
                );
            }

            const completedRequest =
                await this.emergencyRequestRepository.updateAssignedRequestStatus(
                    requestId,
                    mechanicId,
                    "arrived",
                    "completed",
                    { completedAt: now }
                );

            if (!completedRequest) {
                throw new ConflictError(
                    "Unable to complete emergency request in its current state"
                );
            }

            return { request: completedRequest, repair: completedRepair };
        });

        if (this.locationStore) {
            await this.locationStore.delete(requestId).catch(() => undefined);
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(
                result.request,
                {
                    eventName: "emergency_repair_updated",
                    extraPayload: { repair: result.repair.toObject() },
                }
            );
        }

        return result;
    }
}

