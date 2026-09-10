import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { UpdateVehicleDto } from "../../dtos/updateVehicleDto.js";
import { IUpdateVehicelUseCase } from "../../interfaces/vehicle/IUpdateVehicleUsecase.js";

export class UpdateVehicleUseCase implements IUpdateVehicelUseCase {
    constructor(private vehicleRepository: IVehicleRepository) { }
    async updateVehicele(vehicleId: string, userId: string, updateData: UpdateVehicleDto): Promise<Vehicle | null> {
        const vehicle = await this.vehicleRepository.findById(vehicleId)
        if(!vehicle){
            throw new NotfoundError("vehicle not found" , "VEHICLE_NOT_FOUND")
        }
        if(vehicle.userId !== userId){
            throw new ForbiddenError('you do not have permission to update this vehicle',"VEHICLE_ACCESS_DENIED")
        }
        const updateVehicle = await this.vehicleRepository.update(vehicleId, updateData)
        if(!updateVehicle){
            throw new NotfoundError("Vehicle not found", "VEHICLE_NOT_FOUND")
        }
        return updateVehicle
    }
    
}