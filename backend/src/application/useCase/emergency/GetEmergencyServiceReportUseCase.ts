import type { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import type {
    IEmergencyEstimateRepository,
    IEmergencyInspectionRepository,
    IEmergencyPaymentRepository,
    IEmergencyRepairRepository,
} from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import type { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import type { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type { IFileStorageService } from "../../contracts/IFileStorageService.js";
import type { EmergencyServiceReportDto } from "../../dtos/emergency/EmergencyWorkflowDtos.js";
import type { IGetEmergencyServiceReportUseCase } from "../../interfaces/emergency/IEmergencyWorkflowUseCases.js";

export class GetEmergencyServiceReportUseCase
    implements IGetEmergencyServiceReportUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly userRepository: IUserRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly inspectionRepository: IEmergencyInspectionRepository,
        private readonly estimateRepository: IEmergencyEstimateRepository,
        private readonly emergencyPaymentRepository: IEmergencyPaymentRepository,
        private readonly repairRepository: IEmergencyRepairRepository,
        private readonly fileStorageService?: IFileStorageService
    ) {}

    async execute(
        requestId: string,
        requesterId: string
    ): Promise<EmergencyServiceReportDto> {
        const request = await this.emergencyRequestRepository.findById(requestId);
        if (!request) {
            throw new NotfoundError("Emergency request not found");
        }

        if (
            request.userId !== requesterId &&
            request.assignedMechanicId !== requesterId
        ) {
            throw new ForbiddenError(
                "You are not authorized to access this service report"
            );
        }

        if (request.status !== "completed" || !request.assignedMechanicId) {
            throw new ConflictError(
                "Service report is generated after repair completion",
                "SERVICE_REPORT_UNAVAILABLE"
            );
        }

        const [
            customer,
            mechanic,
            vehicle,
            mechanicApp,
            inspection,
            estimates,
            payment,
            repair,
        ] = await Promise.all([
            this.userRepository.findById(request.userId),
            this.userRepository.findById(request.assignedMechanicId),
            this.vehicleRepository.findById(request.vehicleId),
            this.mechanicApplicationRepository.findByUserId(
                request.assignedMechanicId
            ),
            this.inspectionRepository.findByEmergencyRequestId(requestId),
            this.estimateRepository.findAllByEmergencyRequestId(requestId),
            this.emergencyPaymentRepository.findLatestByEmergencyRequestId(
                requestId
            ),
            this.repairRepository.findByEmergencyRequestId(requestId),
        ]);

        if (
            !customer ||
            !mechanic ||
            !vehicle ||
            !inspection ||
            estimates.length === 0 ||
            !payment ||
            payment.status !== "paid" ||
            !repair ||
            repair.status !== "completed"
        ) {
            throw new ConflictError(
                "Incomplete emergency workflow records for service report",
                "INCOMPLETE_SERVICE_REPORT"
            );
        }

        const paidEstimate =
            estimates.find((e) => e.id === payment.estimateId) ?? estimates[0]!;

        let vehicleImage = vehicle.vehicleImage;
        if (
            vehicleImage &&
            this.fileStorageService &&
            !/^https?:\/\//i.test(vehicleImage)
        ) {
            try {
                vehicleImage = await this.fileStorageService.getUrl(vehicleImage);
            } catch {
                // Keep stored key if signing fails
            }
        }

        return {
            reportReference: `EM-${request.id!.slice(-6).toUpperCase()}`,
            emergencyRequestId: request.id!,
            serviceDate: request.createdAt ?? new Date(),
            completedAt: repair.completedAt ?? request.completedAt ?? new Date(),
            issueCategory: request.emergencyIssueCategory,
            issueTitle: request.issueTitle,
            ...(request.issueDescription !== undefined
                ? { issueDescription: request.issueDescription }
                : {}),
            ...(request.location.address !== undefined
                ? { serviceAddress: request.location.address }
                : {}),
            latitude: request.location.latitude,
            longitude: request.location.longitude,
            customer: {
                userId: customer.userId!,
                fullName: customer.fullName,
                email: customer.email,
                phoneNumber: customer.phoneNumber,
            },
            mechanic: {
                mechanicId: mechanic.userId!,
                fullName: mechanic.fullName,
                email: mechanic.email,
                phoneNumber: mechanic.phoneNumber,
                ...(mechanicApp?.workshopName
                    ? { workshopName: mechanicApp.workshopName }
                    : {}),
            },
            vehicle: {
                vehicleId: vehicle.id!,
                brand: vehicle.brand,
                model: vehicle.model,
                registrationNumber: vehicle.registrationNumber,
                vehicleType: vehicle.vehicleType,
                year: vehicle.year,
                fuelType: vehicle.fuelType,
                color: vehicle.color,
                ...(vehicleImage ? { vehicleImage } : {}),
            },
            inspection,
            approvedEstimate: paidEstimate,
            estimateHistoryCount: estimates.length,
            payment: {
                paymentId: payment.id!,
                status: payment.status,
                amount: payment.amount,
                currency: payment.currency,
                razorpayOrderId: payment.razorpayOrderId,
                ...(payment.razorpayPaymentId
                    ? { razorpayPaymentId: payment.razorpayPaymentId }
                    : {}),
                ...(payment.paidAt ? { paidAt: payment.paidAt } : {}),
            },
            repair,
        };
    }
}

