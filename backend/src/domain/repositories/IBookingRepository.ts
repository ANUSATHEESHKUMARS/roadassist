import { Booking, BookingProps } from "../User/entities/Booking.js";
import { BookingSlot, BookingStatus } from "../User/Types/BookingTypes.js";
import { ITransactionContext } from "../../infrastructure/databases/interface/ITransactionContext.js";

export interface IBookingRepository {
    create(booking: Booking, transaction?: ITransactionContext): Promise<Booking>;

    findById(bookingId: string, transaction?: ITransactionContext): Promise<Booking | null>;

    findByIdAndUserId(bookingId: string, userId: string): Promise<Booking | null>;

    findByUserId(
        userId: string,
        page: number,
        limit: number,
        statuses?: BookingStatus[]
    ): Promise<Booking[]>;

    countByUserId(
        userId: string,
        statuses?: BookingStatus[]
    ): Promise<number>;

    findByMechanicId(
        mechanicId: string,
        page: number,
        limit: number
    ): Promise<Booking[]>;

    findConflictingBooking(
        mechanicId: string,
        scheduledDate: Date,
        slot: BookingSlot,
        excludeBookingId?: string,
        transaction?: ITransactionContext
    ): Promise<Booking | null>;

    findConflictingMechanicIds(
        mechanicIds: string[],
        scheduledDate: Date,
        slot: BookingSlot
    ): Promise<Set<string>>;

    findActiveScheduledBookingsByMechanic(
        mechanicId: string,
        startDate: Date,
        endDate?: Date
    ): Promise<Booking[]>;

    updateStatus(
        bookingId: string,
        status: BookingStatus,
        additionalFields?: Partial<BookingProps>,
        expectedCurrentStatuses?: BookingStatus[],
        transaction?: ITransactionContext
    ): Promise<Booking | null>;

    attachPaymentId(
        bookingId: string,
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<Booking | null>;

    expireStaleReservations(now?: Date): Promise<number>;
}
