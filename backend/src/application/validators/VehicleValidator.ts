import { BadRequest } from "../../shared/errors/BadRequestError.js";
import { VehicleDto } from "../dtos/vehicle.js";
import { IVehiclevalidator } from "./interfaces/IVehicleValidator.js";

export class VehicleValidator implements IVehiclevalidator{
    validate(data: VehicleDto): void {
        if(!data.registrationNumber?.trim()){
            throw new BadRequest("Registration number is required" , "REGISTRATION_NUMBER_ISSUE")
        }
        if(!data.vehicleType){
            throw new BadRequest("Vehicle Type is Required" , "VEHICLE_TYPE_REQUIRED")
        }
        if(!data.brand?.trim()){
            throw new BadRequest("Brand is required" , "BRAND_IS_REQUIRED")
        }
          if (!data.model?.trim()) {
            throw new BadRequest(
                "Model is required","MODEL_IS_REQUIRED"
            );
        }
         if (!data.year) {
            throw new BadRequest(
                "Manufacturing year is required",
                "YEAR_NOT_ADDED"
            );
        }
        const currentYear = new Date().getFullYear();

   if (data.year < 1900 || data.year > currentYear) {
            throw new BadRequest(
                "Invalid manufacturing year",
                "YEAR_REQUIRED"
            );
        }
     if (!data.fuelType) {
            throw new BadRequest(
                "Fuel type is required",
                "FUEL_TYPE_REQUIRED"
            );
        }
              if (!["petrol", "diesel", "electric"].includes(data.fuelType)) {
            throw new BadRequest(
                "Invalid fuel type",
                "FUEL_TYPE_INVALID")
            
        }
                if (!data.color?.trim()) {
            throw new BadRequest(
                "Color is required",
                "COLOR_IS_REQUIRED"
            );
        }

    }
}