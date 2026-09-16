import { VehicleMapper } from "../../application/mappers/VehicleMapper.js";
import { IVehicleRepository } from "../../domain/repositories/IVehicleRepository.js";
import { Vehicle } from "../../domain/vehilce/Vehilce.js";
import { IVehicleDocument, VehicleModel } from "../databases/models/VehicleModel.js";
import { MongoBasRepository } from "./MongoBaseRepostory.js";


export class VehicleRepostory extends MongoBasRepository<IVehicleDocument> implements IVehicleRepository {
constructor(){
    super(VehicleModel)
}
    async create(vehicle: Vehicle): Promise<Vehicle> {
        const document = await this.createDocument({
            userId: vehicle.userId,
            registrationNumber: vehicle.registrationNumber,
            vehicleType:vehicle.vehicleType,
            brand: vehicle.brand,
            model: vehicle.model,
            year: vehicle.year,
            fuelType: vehicle.fuelType,
            color: vehicle.color,
            vehicleImage:vehicle.vehicleImage,
            insuranceCertificateImage:vehicle.insuranceCertificateImage,
            pucCertificateImage:vehicle.pucCertificateImage

        })
     return VehicleMapper.toDomain(document)
    }


    async findByUserId(userId: string): Promise<Vehicle[]> {
        const document = await this.model.find({
            userId: userId
        })
     return document.map((document) =>VehicleMapper.toDomain(document))
    }

    async findById(vehicleId: string): Promise<Vehicle | null> {
        const vehicleDetail = await this.findByIdDocument(vehicleId)
        if (!vehicleDetail) {
            return null
        }
     return VehicleMapper.toDomain(vehicleDetail)
    }

    async update(vehicleId: string, vehicle: Partial<Vehicle>): Promise<Vehicle | null> {
        const document = await this.updateDocument(vehicleId, vehicle)
        if (!document) {
            return null
        }

       return VehicleMapper.toDomain(document)
    }
  async delete(vehicleId: string): Promise<boolean> {
      const document = await this.model.findByIdAndDelete(vehicleId)
      
    if (!document) {
        return false;
    }

    return true;
}
  
}

