
import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";

export interface CreateSlotBookingDto {
    vehicleId: string;
    mechanicId: string;
    serviceType: string;
    problemDescription?: string;
    serviceAddress: string;
    scheduledDate: Date;
    slot: BookingSlot;
}
