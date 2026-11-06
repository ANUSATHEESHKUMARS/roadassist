import { BookingMapper } from "../../application/mappers/BookingMapper.js";
import { IBookingReposoitory } from "../../domain/repositories/IBookingRepository.js";
import { Booking } from "../../domain/User/entities/Booking.js";
import { BookingSlot } from "../../domain/User/Types/BookingTypes.js";
import { BookingModel } from "../databases/models/BookingModel.js";

export class BookingRepository implements IBookingReposoitory {
    async create(booking: Booking): Promise<Booking> {
        const bookingData = BookingMapper.toPersistence(booking)
        const createBooking = await BookingModel.create(bookingData)
        return BookingMapper.toDomain(createBooking)
    }

    async findById(bookingId: string): Promise<Booking | null> {
        const booking = await BookingModel.findById(bookingId)
        if (!booking) {
            return null
        }
        return BookingMapper.toDomain(booking)
    }
    async findByUserId(userId: string, page: number, limit: number): Promise<Booking[]> {
        const skip = (page - 1) * limit
        const booking = await BookingModel.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return booking.map((booking) => BookingMapper.toDomain(booking))
    }
    async findByMechanicId(mechanicId: string, page: number, limit: number): Promise<Booking[]> {
        const skip = (page - 1) * limit
        const booking = await BookingModel.find({ mechanicId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        return booking.map((booking) => BookingMapper.toDomain(booking))
    }
    async findConflictingBooking(mechanicId: string, scheduledDate: Date, slot: BookingSlot): Promise<Booking | null> {
        const booking = await BookingModel.findOne({
            mechanicId,
            scheduledDate,
            slot,
            status: {
                $in: [
                    "pending",
                    "accepted",
                    "confirmed",
                    "in_progress"
                ]
            }
        })
        if(!booking){
            return null
        }
        return BookingMapper.toDomain(booking)
    }
}