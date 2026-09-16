import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { UpdateVehicleDto } from "../../dtos/updateVehicleDto.js";

export interface IUpdateVehicelUseCase{
    updateVehicele(vehicleId : string, userId : string , updateData: UpdateVehicleDto,   files: {
            vehicleImage?: Express.Multer.File | undefined;
            insuranceCertificateImage?: Express.Multer.File | undefined;
            pucCertificateImage?: Express.Multer.File | undefined;
        }):Promise<Vehicle| null>
}

