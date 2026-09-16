import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { UpdateVehicleDto } from "../../dtos/updateVehicleDto.js";
import { IUpdateVehicelUseCase } from "../../interfaces/vehicle/IUpdateVehicleUsecase.js";

export class UpdateVehicleUseCase implements IUpdateVehicelUseCase {
    constructor(private vehicleRepository: IVehicleRepository,
        private fileStoregeService : IFileStorageService
    ) { }
    async updateVehicele(vehicleId: string, userId: string, updateData: UpdateVehicleDto, files: {
        vehicleImage?: Express.Multer.File | undefined;
        insuranceCertificateImage?: Express.Multer.File | undefined;
        pucCertificateImage?: Express.Multer.File | undefined;
    }): Promise<Vehicle | null> {
        const vehicle = await this.vehicleRepository.findById(vehicleId)
        if (!vehicle) {
            throw new NotfoundError("vehicle not found", "VEHICLE_NOT_FOUND")
        }
        if (vehicle.userId !== userId) {
            throw new ForbiddenError('you do not have permission to update this vehicle', "VEHICLE_ACCESS_DENIED")
        }


           // Keep existing image URLs
        let vehicleImageUrl = vehicle.vehicleImage;
        let insuranceCertificateImageUrl = vehicle.insuranceCertificateImage;
        let pucCertificateImageUrl = vehicle.pucCertificateImage;

        // Upload new vehicle image
        if (files.vehicleImage) {
            vehicleImageUrl = await this.fileStoregeService.upload(
                files.vehicleImage.buffer,
                "roadassist/vehicles"
            );
        }

        // Upload new insurance certificate
        if (files.insuranceCertificateImage) {
            insuranceCertificateImageUrl = await this.fileStoregeService.upload(
                files.insuranceCertificateImage.buffer,
                "roadassist/vehicles/insurance"
            );
        }

        // Upload new PUC certificate
        if (files.pucCertificateImage) {
            pucCertificateImageUrl = await this.fileStoregeService.upload(
                files.pucCertificateImage.buffer,
                "roadassist/vehicles/puc"
            );
        }

        const vehicleDataToUpdate: Partial<Vehicle> = {
            ...updateData,
            vehicleImage: vehicleImageUrl,
            insuranceCertificateImage: insuranceCertificateImageUrl,
            pucCertificateImage: pucCertificateImageUrl
        };

        const updateVehicle = await this.vehicleRepository.update(vehicleId, vehicleDataToUpdate)
        if (!updateVehicle) {
            throw new NotfoundError("Vehicle not found", "VEHICLE_NOT_FOUND")
        }
        return updateVehicle
    }

}