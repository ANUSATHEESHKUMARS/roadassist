import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IGetVehicleUseCase } from "../../interfaces/vehicle/IGetVehicle.js";

export class GetVehilceUseCase implements IGetVehicleUseCase{
    constructor(private vehicleRepository : IVehicleRepository,
        private fileStorageService : IFileStorageService

    ){}
    getVehicle = async(userId: string): Promise<Vehicle[]>  =>{
        const list = await this.vehicleRepository.findByUserId(userId)
        for (const vehicle of list) {

            if (vehicle.vehicleImage) {
                vehicle.vehicleImage =
                    await this.fileStorageService.getUrl(
                        vehicle.vehicleImage
                    );
            }

            if (vehicle.insuranceCertificateImage) {
                vehicle.insuranceCertificateImage =
                    await this.fileStorageService.getUrl(
                        vehicle.insuranceCertificateImage
                    );
            }

            if (vehicle.pucCertificateImage) {
                vehicle.pucCertificateImage =
                    await this.fileStorageService.getUrl(
                        vehicle.pucCertificateImage
                    );
            }
        }

        return list;
    }
}