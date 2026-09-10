import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { VehicleDto } from "../../dtos/vehicle.js";

export interface ICreateVehicleUseCase{
    execute(vehicleDto:VehicleDto, userId: string):Promise<Vehicle>
} 