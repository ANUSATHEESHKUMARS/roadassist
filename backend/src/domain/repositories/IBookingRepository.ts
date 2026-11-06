import { Booking } from "../User/entities/Booking.js";
import { BookingSlot } from "../User/Types/BookingTypes.js";


export interface IBookingReposoitory {
    create(booking : Booking): Promise<Booking>
    findById(bookingId:string):Promise<Booking | null>;
    findByUserId(userId:string, page:number, limit:number):Promise<Booking[]>;
    findByMechanicId(mechanicId:string, page:number, limit : number):Promise<Booking[]>;
    findConflictingBooking(mechanicId: string,scheduledDate:Date, slot:BookingSlot):Promise<Booking | null>
}