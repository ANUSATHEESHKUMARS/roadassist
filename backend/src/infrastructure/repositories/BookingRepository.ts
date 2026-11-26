
import { BookingMapper } from "../../application/mappers/BookingMapper.js";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository.js";
import { Booking } from "../../domain/User/entities/Booking.js";
import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { BookingModel } from "../databases/models/BookingModel.js";

export class BookingRepository implements IBookingRepository {

    async create(booking: Booking): Promise<Booking> {
        const bookingData = BookingMapper.toPersistence(booking);

        const createdBooking = await BookingModel.create(bookingData);

        return BookingMapper.toDomain(createdBooking);
    }

    async findById(bookingId: string): Promise<Booking | null> {
        const booking = await BookingModel.findById(bookingId);

        if (!booking) {
            return null;
        }

        return BookingMapper.toDomain(booking);
    }

    async findByUserId(
        userId: string,
        page: number,
        limit: number
    ): Promise<Booking[]> {
        const skip = (page - 1) * limit;

        const bookings = await BookingModel.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return bookings.map(booking =>
            BookingMapper.toDomain(booking)
        );
    }

    async findByMechanicId(
        mechanicId: string,
        page: number,
        limit: number
    ): Promise<Booking[]> {
        const skip = (page - 1) * limit;

        const bookings = await BookingModel.find({ mechanicId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return bookings.map(booking =>
            BookingMapper.toDomain(booking)
        );
    }

    async findConflictingBooking(
    mechanicId: string,
    scheduledDate: Date,
    slot: BookingSlot
): Promise<Booking | null> {

    const { startOfDay, endOfDay } =
        this.getIndiaDayRange(scheduledDate);

    // Determine conflicting slots.
    const conflictingSlots: BookingSlot[] =
        slot === "full_day"
            ? ["morning", "afternoon", "full_day"]
            : [slot, "full_day"];

    const booking = await BookingModel.findOne({
        mechanicId,

        scheduledDate: {
            $gte: startOfDay,
            $lt: endOfDay
        },

        slot: {
            $in: conflictingSlots
        },

        status: {
            $in: [
                "pending",
                "accepted",
                "confirmed",
                "in_progress"
            ]
        }
    });

    if (!booking) {
        return null;
    }

    return BookingMapper.toDomain(booking);
}

    private getIndiaDayRange(date: Date): {
    startOfDay: Date;
    endOfDay: Date;
} {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).formatToParts(date);

    const get = (type: string): number => {
        const value = parts.find(part => part.type === type)?.value;

        if (!value) {
            throw new Error(`Unable to determine ${type} from date`);
        }

        return Number(value);
    };

    const year = get("year");
    const month = get("month");
    const day = get("day");

    // Convert Indian midnight to UTC.
    const startOfDay = new Date(
        Date.UTC(year, month - 1, day) - (5 * 60 + 30) * 60 * 1000
    );

    const endOfDay = new Date(
        startOfDay.getTime() + 24 * 60 * 60 * 1000
    );

    return { startOfDay, endOfDay };
}
}

