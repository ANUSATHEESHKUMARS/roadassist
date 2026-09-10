import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { UpdateVehicleDto } from "../../dtos/updateVehicleDto.js";

export interface IUpdateVehicelUseCase{
    updateVehicele(vehicleId : string, userId : string , updateData: UpdateVehicleDto):Promise<Vehicle| null>
}

