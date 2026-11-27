import { Booking, BookingProps } from "../User/entities/Booking.js";
import { BookingSlot, BookingStatus } from "../User/Types/BookingTypes.js";
import { ITransactionContext } from "../../infrastructure/databases/interface/ITransactionContext.js";

export type MechanicBookingFilterOption =
    | "all"
    | "upcoming"
    | "today"
    | "in_progress"
    | "completed"
    | "cancelled";

export type MechanicBookingSortOption = "upcoming" | "newest";

export interface FindMechanicBookingsCriteria {
    mechanicId: string;
    page: number;
    limit: number;
    filter?: MechanicBookingFilterOption;
    search?: string;
    matchingCustomerIds?: string[];
    dateKey?: string;
    serviceType?: string;
    sort?: MechanicBookingSortOption;
    now?: Date;
}

export interface MechanicBookingCounts {
    total: number;
    upcoming: number;
    today: number;
    inProgress: number;
    completed: number;
    cancelled: number;
}

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

    findMechanicBookings(
        criteria: FindMechanicBookingsCriteria
    ): Promise<{ bookings: Booking[]; total: number }>;

    getMechanicBookingCounts(
        mechanicId: string,
        now?: Date
    ): Promise<MechanicBookingCounts>;

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
