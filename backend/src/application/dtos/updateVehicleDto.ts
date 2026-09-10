import { FuelType } from "../../domain/vehilce/Vehilce.js";

export interface UpdateVehicleDto {
    registrationNumber? :string,
    brand? : string,
    model? : string,
    year? : number,
    fuelType? : FuelType,
    color?:string
}


