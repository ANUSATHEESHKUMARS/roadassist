import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../../domain/vehilce/Vehilce.js";
import { VehicleDto } from "../../dtos/vehicle.js";
import { ICreateVehicleUseCase } from "../../interfaces/vehicle/ICreateVehicle.js";

export class CreateVehicleUseCase implements ICreateVehicleUseCase{
    constructor(private vehicleRepository:IVehicleRepository){}
     async execute(vehicleDto: VehicleDto, userId : string): Promise<Vehicle> {
          const vehicle = new Vehicle
          (
            userId,
            vehicleDto.registrationNumber,
            vehicleDto.brand,
            vehicleDto.model,
            vehicleDto.year,
            vehicleDto.fuelType,
            vehicleDto.color,
            
          )
          return await this.vehicleRepository.create(vehicle)
     }
}   


