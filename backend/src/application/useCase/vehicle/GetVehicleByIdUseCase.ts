import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IGetVehicleBYIdUseCase } from "../../interfaces/vehicle/IGetvehicleByid.js";

export class GetVehicleByIdUseCase implements IGetVehicleBYIdUseCase{
  constructor(private vehicleRepostory: IVehicleRepository){}
  
  getVehicleById = async(vehicleId: string): Promise<Vehicle | null>=> {
      const vehicle = await this.vehicleRepostory.findById(vehicleId)
      if(!vehicle){
        throw new NotfoundError("vehicle not found" , "VEHICLE_NOT_FOUND")
      }
      return vehicle

  }
}