import { VehicleDto } from "../../dtos/vehicle.js";

export interface IVehiclevalidator{
    validate(data:VehicleDto):void
}