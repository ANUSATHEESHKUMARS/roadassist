import { Vehicle } from "../../../domain/vehilce/Vehilce.js";

export interface IGetVehicleBYIdUseCase{
    getVehicleById(vehicleId:string):Promise<Vehicle|null>
}