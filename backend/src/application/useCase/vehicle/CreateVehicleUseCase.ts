import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { VehicleDto } from "../../dtos/vehicle.js";
import { ICreateVehicleUseCase } from "../../interfaces/vehicle/ICreateVehicle.js";
import { IVehiclevalidator } from "../../validators/interfaces/IVehicleValidator.js";

export class CreateVehicleUseCase implements ICreateVehicleUseCase {
     constructor(private vehicleRepository: IVehicleRepository,
          private vehicleValidator: IVehiclevalidator,
          private fileStorageService: IFileStorageService
     ) { }
     async execute(vehicleDto: VehicleDto, userId: string, files: {
          vehicleImage?: Express.Multer.File | undefined,
          insuranceCertificateImage?: Express.Multer.File | undefined;
          pucCertificateImage?: Express.Multer.File | undefined;
     }): Promise<Vehicle> {
          console.log("FILES RECEIVED IN USE CASE:", files);

          this.vehicleValidator.validate(vehicleDto)


          let vehicleImageUrl: string | undefined

          if (files.vehicleImage) {
               vehicleImageUrl = await this.fileStorageService.upload(files.vehicleImage.buffer, "roadassist/vehicles")
          }

          let insuranceCertificateImageUrl: string | undefined

          if (files.insuranceCertificateImage) {
               insuranceCertificateImageUrl = await this.fileStorageService.upload(files.insuranceCertificateImage.buffer, "roadassist/vehicles/insurance")
          }
          let pucCertificateImageUrl: string | undefined
          if (files.pucCertificateImage) {
               pucCertificateImageUrl = await this.fileStorageService.upload(
                    files.pucCertificateImage.buffer,
                    "roadassist/vehicles/puc"
               );
          }
          console.log("IMAGE URLS:", {
               vehicleImageUrl,
               insuranceCertificateImageUrl,
               pucCertificateImageUrl
          });

          const vehicle = new Vehicle
               (
                    userId,
                    vehicleDto.registrationNumber,
                    vehicleDto.vehicleType,
                    vehicleDto.brand,
                    vehicleDto.model,
                    vehicleDto.year,
                    vehicleDto.fuelType,
                    vehicleDto.color,
                    vehicleImageUrl,
                    insuranceCertificateImageUrl,
                    pucCertificateImageUrl

               )
          return await this.vehicleRepository.create(vehicle)
     }
}


