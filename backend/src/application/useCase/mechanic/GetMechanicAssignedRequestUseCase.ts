import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import {
    IEmergencyEstimateRepository,
    IEmergencyInspectionRepository,
    IEmergencyPaymentRepository,
    IEmergencyRepairRepository,
} from "../../../domain/repositories/IEmergencyWorkflowRepositories.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import type { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IGetAssignedEmergencyRequestDetailsUseCase } from "../../interfaces/IMechanicEmergencyUseCases.js";

export class GetAssignedEmergencyRequestDetailsUseCase
    implements IGetAssignedEmergencyRequestDetailsUseCase
{
    constructor(
        private readonly emergencyRequestRepository: IEmergencyRequestRepository,
        private readonly vehicleRepository?: IVehicleRepository,
        private readonly inspectionRepository?: IEmergencyInspectionRepository,
        private readonly estimateRepository?: IEmergencyEstimateRepository,
        private readonly emergencyPaymentRepository?: IEmergencyPaymentRepository,
        private readonly repairRepository?: IEmergencyRepairRepository,
        private readonly fileStorageService?: IFileStorageService
    ) {}

    async execute(
        requestId: string,
        mechanicId: string
    ): Promise<{
        request: EmergencyRequest;
        customerDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        } | null;
        vehicleDetails?: {
            vehicleId: string;
            brand: string;
            model: string;
            registrationNumber: string;
            vehicleType: string;
            year: number;
            fuelType: string;
            color: string;
            vehicleImage?: string;
        } | null;
        inspection?: unknown | null;
        latestEstimate?: unknown | null;
        estimateHistory?: unknown[];
        payment?: unknown | null;
        repair?: unknown | null;
    }> {
        if (!requestId || !requestId.trim()) {
            throw new BadRequest("Request ID is required");
        }

        const result =
            await this.emergencyRequestRepository.findByIdWithCustomerDetails(
                requestId
            );

        if (!result) {
            throw new NotfoundError("Emergency request not found");
        }

        if (result.request.assignedMechanicId !== mechanicId) {
            throw new ForbiddenError("You are not assigned to this request");
        }

        const [vehicle, inspection, estimates, payment, repair] =
            await Promise.all([
                this.vehicleRepository
                    ? this.vehicleRepository.findById(result.request.vehicleId)
                    : Promise.resolve(null),
                this.inspectionRepository
                    ? this.inspectionRepository.findByEmergencyRequestId(
                          requestId
                      )
                    : Promise.resolve(null),
                this.estimateRepository
                    ? this.estimateRepository.findAllByEmergencyRequestId(
                          requestId
                      )
                    : Promise.resolve([]),
                this.emergencyPaymentRepository
                    ? this.emergencyPaymentRepository.findLatestByEmergencyRequestId(
                          requestId
                      )
                    : Promise.resolve(null),
                this.repairRepository
                    ? this.repairRepository.findByEmergencyRequestId(requestId)
                    : Promise.resolve(null),
            ]);

        let vehicleImage = vehicle?.vehicleImage;
        if (
            vehicleImage &&
            this.fileStorageService &&
            !/^https?:\/\//i.test(vehicleImage)
        ) {
            try {
                vehicleImage = await this.fileStorageService.getUrl(vehicleImage);
            } catch {
                // Keep stored key fallback
            }
        }

        const vehicleDetails = vehicle
            ? {
                  vehicleId: vehicle.id!,
                  brand: vehicle.brand,
                  model: vehicle.model,
                  registrationNumber: vehicle.registrationNumber,
                  vehicleType: vehicle.vehicleType,
                  year: vehicle.year,
                  fuelType: vehicle.fuelType,
                  color: vehicle.color,
                  ...(vehicleImage ? { vehicleImage } : {}),
              }
            : null;

        return {
            ...result,
            ...(this.vehicleRepository ? { vehicleDetails } : {}),
            ...(this.inspectionRepository
                ? { inspection: inspection ? inspection.toObject() : null }
                : {}),
            ...(this.estimateRepository
                ? {
                      latestEstimate: estimates[0]
                          ? estimates[0].toObject()
                          : null,
                      estimateHistory: estimates.map((e) => e.toObject()),
                  }
                : {}),
            ...(this.emergencyPaymentRepository
                ? {
                      payment:
                          payment && payment.status === "paid"
                              ? {
                                    paymentId: payment.id!,
                                    estimateId: payment.estimateId,
                                    estimateRevision: payment.estimateRevision,
                                    amount: payment.amount,
                                    currency: payment.currency,
                                    status: payment.status,
                                    paidAt: payment.paidAt,
                                }
                              : null,
                  }
                : {}),
            ...(this.repairRepository
                ? { repair: repair ? repair.toObject() : null }
                : {}),
        };
    }
}

