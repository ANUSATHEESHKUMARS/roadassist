import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";

export interface CreateSlotBookingDto {
    userId:string,
    vehicleId:string,
    mechanicId:string,
    serviceAddress:string,
    scheduledDate:Date,
    slot:BookingSlot
}