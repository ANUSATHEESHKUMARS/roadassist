import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IGetVehicleUseCase } from "../../interfaces/vehicle/IGetVehicle.js";

export class GetVehilceUseCase implements IGetVehicleUseCase{
    constructor(private vehicleRepository : IVehicleRepository){}
    getVehicle = async(userId: string): Promise<Vehicle[]>  =>{
        const list = await this.vehicleRepository.findByUserId(userId)
        if(!list){
            throw new BadRequest("vehicle not found" , "VEHICLE_NOT_FOUND")
        }
      return list
    }
}