import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../domain/vehilce/Vehilce.js";
import { VehicleModel } from "../databases/models/VehicleModel.js";


export class VehicleRepostory implements IVehicleRepository {

    async create(vehicle: Vehicle): Promise<Vehicle> {
        const document = await VehicleModel.create({
            userId: vehicle.userId,
            registrationNumber: vehicle.registrationNumber,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            fuelType: vehicle.fuelType,
            color: vehicle.color
        })
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


    async findByUserId(userId: string): Promise<Vehicle[]> {
        const document = await VehicleModel.find({
            userId: userId
        })
        return document.map((document) => {
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
        })
    }

    async findById(vehicleId: string): Promise<Vehicle | null> {
        const vehicleDetail = await VehicleModel.findById(vehicleId)
        if (!vehicleDetail) {
            return null
        }
        return new Vehicle(
            vehicleDetail.userId,
            vehicleDetail.registrationNumber,
            vehicleDetail.brand,
            vehicleDetail.model,
            vehicleDetail.year,
            vehicleDetail.fuelType,
            vehicleDetail.color,
            vehicleDetail._id.toString()
        )
    }

    async update(vehicleId: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
        const document = await VehicleModel.findByIdAndUpdate(vehicleId, vehicle, { new: true, runValidators: true })
        if (!document) {
            return null
        }

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
  async delete(vehicleId: string): Promise<boolean> {
      const document = await VehicleModel.findByIdAndDelete(vehicleId)
      if(!document){
        return false
      }
      return true
  }
}