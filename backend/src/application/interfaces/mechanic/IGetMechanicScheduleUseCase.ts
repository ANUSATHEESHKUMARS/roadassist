import { MechanicSchedule } from "../../../domain/User/entities/MechanicSchedule.js";
import { BookingSlot, BookingStatus } from "../../../domain/User/Types/BookingTypes.js";

export interface MechanicBookedDateItem {
    bookingId: string;
    date: string;
    slot: BookingSlot;
    status: BookingStatus;
}

export interface IGetMechanicScheduleUseCase {
    execute(mechanicId: string): Promise<MechanicSchedule | null>;
    getBookedDates(
        mechanicId: string,
        month?: string
    ): Promise<MechanicBookedDateItem[]>;
}