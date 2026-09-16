import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { VehicleDto } from "../../dtos/vehicle.js";

export interface ICreateVehicleUseCase{
    execute(vehicleDto:VehicleDto, userId: string , files : {vehicleImage? : Express.Multer.File | undefined;
        insuranceCertificateImage?: Express.Multer.File | undefined;
        pucCertificateImage?:Express.Multer.File | undefined
    } ):Promise<Vehicle>
} 