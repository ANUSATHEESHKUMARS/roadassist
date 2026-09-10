import { Vehicle } from "../../domain/vehilce/Vehilce.js";
import { IVehicleDocument } from "../../infrastructure/databases/models/VehicleModel.js";

export class VehicleMapper {
    static toDomain(document : IVehicleDocument):Vehicle{
        return new Vehicle(
            document.userId,
            document.registrationNumber,
            document.brand,
            document.model,
            document.year,
            document.fuelType,
            document.color,
            document._id.toString()
        )
    }
}