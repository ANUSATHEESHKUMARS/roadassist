import { Booking } from "../../domain/User/entities/Booking.js";
import { BookingModel, IBookingDocument } from "../../infrastructure/databases/models/BookingModel.js";
import { getIndiaDayKey } from "../../shared/utils/timezone.js";

export class BookingMapper {
    static toDomain(document: IBookingDocument): Booking {
        return Booking.create({
            id: document._id.toString(),
            userId: document.userId.toString(),
            vehicleId: document.vehicleId.toString(),
            mechanicId: document.mechanicId.toString(),
            bookingType: document.bookingType,
            serviceType: document.serviceType,
            ...(document.problemDescription !== undefined
                ? { problemDescription: document.problemDescription }
                : {}),
            serviceAddress: document.serviceAddress,
            ...(document.latitude !== undefined ? { latitude: document.latitude } : {}),
            ...(document.longitude !== undefined ? { longitude: document.longitude } : {}),
            scheduledDate: document.scheduledDate,
            slot: document.slot,
            bookingAmount: document.bookingAmount,
            ...(document.estimatedAmount !== undefined
                ? { estimatedAmount: document.estimatedAmount }
                : {}),
            status: document.status,
            ...(document.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: document.reservationExpiresAt }
                : {}),
            ...(document.paymentId !== undefined
                ? { paymentId: document.paymentId.toString() }
                : {}),
            ...(document.confirmedAt !== undefined
                ? { confirmedAt: document.confirmedAt }
                : {}),
            ...(document.startedAt !== undefined
                ? { startedAt: document.startedAt }
                : {}),
            ...(document.completedAt !== undefined
                ? { completedAt: document.completedAt }
                : {}),
            ...(document.cancelledAt !== undefined
                ? { cancelledAt: document.cancelledAt }
                : {}),
            ...(document.expiredAt !== undefined
                ? { expiredAt: document.expiredAt }
                : {}),
            ...(document.requestedAt !== undefined
                ? { requestedAt: document.requestedAt }
                : {}),
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        });
    }

    static toPersistence(booking: Booking) {
        const occupiedShifts: ("morning" | "afternoon")[] =
            booking.slot === "full_day"
                ? ["morning", "afternoon"]
                : [booking.slot];

        return {
            userId: booking.userId,
            vehicleId: booking.vehicleId,
            mechanicId: booking.mechanicId,
            bookingType: booking.bookingType,
            serviceType: booking.serviceType,
            ...(booking.problemDescription !== undefined
                ? { problemDescription: booking.problemDescription }
                : {}),
            serviceAddress: booking.serviceAddress,
            ...(booking.latitude !== undefined ? { latitude: booking.latitude } : {}),
            ...(booking.longitude !== undefined ? { longitude: booking.longitude } : {}),
            scheduledDate: booking.scheduledDate,
            scheduledDateDayKey: getIndiaDayKey(booking.scheduledDate),
            slot: booking.slot,
            occupiedShifts,
            bookingAmount: booking.bookingAmount,
            ...(booking.estimatedAmount !== undefined
                ? { estimatedAmount: booking.estimatedAmount }
                : {}),
            status: booking.status,
            ...(booking.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: booking.reservationExpiresAt }
                : {}),
            ...(booking.paymentId !== undefined
                ? { paymentId: booking.paymentId }
                : {}),
            ...(booking.confirmedAt !== undefined
                ? { confirmedAt: booking.confirmedAt }
                : {}),
            ...(booking.startedAt !== undefined
                ? { startedAt: booking.startedAt }
                : {}),
            ...(booking.completedAt !== undefined
                ? { completedAt: booking.completedAt }
                : {}),
            ...(booking.cancelledAt !== undefined
                ? { cancelledAt: booking.cancelledAt }
                : {}),
            ...(booking.expiredAt !== undefined
                ? { expiredAt: booking.expiredAt }
                : {}),
            ...(booking.requestedAt !== undefined
                ? { requestedAt: booking.requestedAt }
                : {}),
        };
    }
}

export type BookingDocumentType = InstanceType<typeof BookingModel>;
