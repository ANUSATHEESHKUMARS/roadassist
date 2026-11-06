import { Booking } from "../../domain/User/entities/Booking.js";
import { BookingModel } from "../../infrastructure/databases/models/BookingModel.js";

export class BookingMapper{
    static toDomain(document : InstanceType<typeof BookingModel>):Booking {
        return Booking.create({
            id:document._id.toString(),
            userId:document.userId.toString(),
            vehicleId:document.vehicleId.toString(),
            mechanicId:document.mechanicId.toString(),
            serviceType:document.serviceType,
            serviceAddress:document.serviceAddress,
            scheduledDate:document.scheduledDate,
            slot:document.slot,
            estimatedAmount:document.estimatedAmount,
            status:document.status,
            createdAt:document.createdAt,
            updatedAt:document.updatedAt


        })
    }
    static toPersistence(booking:Booking){
        return {
            userId:booking.userId,
            vehicleId:booking.vehicleId,
            mechanicId:booking.mechanicId,
            serviceType:booking.serviceType,
            serviceAddress:booking.serviceAddress,
            scheduledDate:booking.scheduledDate,
            slot:booking.slot,
            estimatedAmount:booking.estimatedAmount,
            status:booking.status
        }
    }
}