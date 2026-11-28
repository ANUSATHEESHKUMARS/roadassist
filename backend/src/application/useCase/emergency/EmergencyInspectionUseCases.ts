import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type { IEmergencyInspectionRepository } from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import {
    EmergencyInspection,
    FindingSeverity,
} from "../../../domain/User/entities/EmergencyWorkflow.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type { CompleteEmergencyInspectionDto } from "../../dtos/emergency/EmergencyWorkflowDtos.js";
import type {
    ICompleteEmergencyInspectionUseCase,
    IStartEmergencyInspectionUseCase,
} from "../../interfaces/emergency/IEmergencyWorkflowUseCases.js";
import type { IMechanicNotificationService } from "../../interfaces/mechanic/IMechanicNotificationService.js";

const VALID_SEVERITIES: FindingSeverity[] = ["low", "medium", "high"];

export class StartEmergencyInspectionUseCase
    implements IStartEmergencyInspectionUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly inspectionRepository: IEmergencyInspectionRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string
    ): Promise<EmergencyInspection> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
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
                "Mechanic must confirm arrival before starting vehicle inspection",
                "ARRIVAL_REQUIRED"
            );
        }

        const existing = await this.inspectionRepository.findByEmergencyRequestId(
            requestId
        );

        let inspection: EmergencyInspection;
        const now = new Date();

        if (!existing) {
            inspection = await this.inspectionRepository.create(
                new EmergencyInspection({
                    emergencyRequestId: requestId,
                    mechanicId,
                    vehicleId: request.vehicleId,
                    status: "in_progress",
                    findings: [],
                    requiredRepairs: [],
                    startedAt: now,
                })
            );
        } else if (existing.status === "pending") {
            const updated = await this.inspectionRepository.updateWithStatusGuard(
                requestId,
                mechanicId,
                ["pending"],
                { status: "in_progress", startedAt: now }
            );
            if (!updated) {
                throw new ConflictError("Unable to start inspection");
            }
            inspection = updated;
        } else if (existing.status === "in_progress") {
            throw new ConflictError(
                "Vehicle inspection is already in progress",
                "INSPECTION_ALREADY_STARTED"
            );
        } else {
            throw new ConflictError(
                "Vehicle inspection has already been completed",
                "INSPECTION_ALREADY_COMPLETED"
            );
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_inspection_updated",
                extraPayload: { inspection: inspection.toObject() },
            });
        }

        return inspection;
    }
}

export class CompleteEmergencyInspectionUseCase
    implements ICompleteEmergencyInspectionUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly inspectionRepository: IEmergencyInspectionRepository,
        private readonly notificationService?: IMechanicNotificationService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string,
        dto: CompleteEmergencyInspectionDto
    ): Promise<EmergencyInspection> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        if (
            !dto ||
            typeof dto.vehicleConditionSummary !== "string" ||
            dto.vehicleConditionSummary.trim().length < 3
        ) {
            throw new BadRequest(
                "Vehicle condition summary must be at least 3 characters",
                "INVALID_INSPECTION_SUMMARY"
            );
        }

        if (!Array.isArray(dto.findings) || dto.findings.length === 0) {
            throw new BadRequest(
                "At least one inspection finding is required",
                "INSPECTION_FINDINGS_REQUIRED"
            );
        }

        const sanitizedFindings = dto.findings.map((finding, idx) => {
            if (
                !finding ||
                typeof finding.component !== "string" ||
                finding.component.trim().length < 2 ||
                typeof finding.issue !== "string" ||
                finding.issue.trim().length < 2
            ) {
                throw new BadRequest(
                    `Inspection finding #${idx + 1} requires valid component and issue descriptions`
                );
            }
            const severity: FindingSeverity = VALID_SEVERITIES.includes(
                finding.severity as FindingSeverity
            )
                ? (finding.severity as FindingSeverity)
                : "medium";
            return {
                component: finding.component.trim(),
                issue: finding.issue.trim(),
                severity,
                ...(typeof finding.recommendedAction === "string" &&
                finding.recommendedAction.trim()
                    ? { recommendedAction: finding.recommendedAction.trim() }
                    : {}),
            };
        });

        const requiredRepairs = Array.isArray(dto.requiredRepairs)
            ? dto.requiredRepairs
                  .filter((r): r is string => typeof r === "string" && r.trim().length > 0)
                  .map((r) => r.trim())
            : [];

        if (requiredRepairs.length === 0) {
            throw new BadRequest(
                "Specify at least one required repair item",
                "REQUIRED_REPAIRS_EMPTY"
            );
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
                "Inspection can only be completed after confirming arrival"
            );
        }

        const updated = await this.inspectionRepository.updateWithStatusGuard(
            requestId,
            mechanicId,
            ["in_progress"],
            {
                status: "completed",
                vehicleConditionSummary: dto.vehicleConditionSummary.trim(),
                findings: sanitizedFindings,
                requiredRepairs,
                ...(typeof dto.notes === "string" && dto.notes.trim()
                    ? { notes: dto.notes.trim() }
                    : {}),
                completedAt: new Date(),
            }
        );

        if (!updated) {
            throw new ConflictError(
                "Inspection must be started before it can be completed",
                "INSPECTION_NOT_IN_PROGRESS"
            );
        }

        if (this.notificationService) {
            await this.notificationService.notifyCustomerRequestUpdated(request, {
                eventName: "emergency_inspection_updated",
                extraPayload: { inspection: updated.toObject() },
            });
        }

        return updated;
    }
}

