import { FuelType, VehicleType } from "../../domain/vehilce/Vehilce.js";

export interface UpdateVehicleDto {
    registrationNumber? :string,
    brand? : string,
    vehicleType?:VehicleType,
    model? : string,
    year? : number,
    fuelType? : FuelType,
    color?:string
}


