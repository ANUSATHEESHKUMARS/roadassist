import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IRemoveVehicleUseCase } from "../../interfaces/vehicle/IRemoveVehicle.js";

export class DeleteVehicleUseCase implements IRemoveVehicleUseCase{
    constructor(private vehicleRepository : IVehicleRepository){}
   async  deleteById(vehicleId: string, userId : string): Promise<string> {
        const vehicle = await this.vehicleRepository.findById(vehicleId)
        if(!vehicle){
            throw new NotfoundError("vehicle is not found", "VEHICLE_NOT_FOUND")
        }
        if(vehicle.userId !== userId){
            throw new ForbiddenError("you do not have the permission to delete the vehicle", "PERMISSION_REQUIRED")
        }
        const deleteData = await this.vehicleRepository.delete(vehicleId)

        if(!deleteData){
            throw new NotfoundError("Vehicle is not found", "VEHICLE_IS_NOT_FOUND")
        }
        return "Vehicle deleted succesfully"
    }
}