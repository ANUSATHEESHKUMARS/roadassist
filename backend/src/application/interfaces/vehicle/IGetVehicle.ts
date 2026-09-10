import { Vehicle } from "../../../domain/vehilce/Vehilce.js";

export interface IGetVehicleUseCase {
    getVehicle(userId : string) : Promise<Vehicle[]>
}