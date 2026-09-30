import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IGetVehicleBYIdUseCase } from "../../interfaces/vehicle/IGetvehicleByid.js";

export class GetVehicleByIdUseCase implements IGetVehicleBYIdUseCase {
  constructor(private vehicleRepostory: IVehicleRepository,
    private fileStorageService: IFileStorageService
  ) { }

  getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
    const vehicle = await this.vehicleRepostory.findById(vehicleId)


    if (!vehicle) {
      throw new NotfoundError(
        "vehicle not found",
        "VEHICLE_NOT_FOUND"
      );
    }
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

    return vehicle;
  };


}