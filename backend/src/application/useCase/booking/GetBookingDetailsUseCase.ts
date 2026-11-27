import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { BookingDetailsResponseDto } from "../../dtos/booking/ScheduledBookingDtos.js";
import { IGetBookingDetailsUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

export class GetBookingDetailsUseCase implements IGetBookingDetailsUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly vehicleRepository?: IVehicleRepository,
        private readonly userRepository?: IUserRepository,
        private readonly mechanicApplicationRepository?: IMechanicApplicationRepository
    ) {}

    async execute(
        userId: string,
        bookingId: string
    ): Promise<BookingDetailsResponseDto> {
        const validBookingId = BookingValidator.validateNonEmptyString(
            bookingId,
            "Booking ID"
        );

        let booking = await this.bookingRepository.findById(validBookingId);
        if (!booking) {
            throw new NotfoundError("Booking not found", "BOOKING_NOT_FOUND");
        }

        if (booking.userId !== userId && booking.mechanicId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to view this booking",
                "BOOKING_FORBIDDEN"
            );
        }

        const now = new Date();
        if (
            booking.status === "pending_payment" &&
            booking.reservationExpiresAt &&
            booking.reservationExpiresAt <= now
        ) {
            const expired = await this.bookingRepository.updateStatus(
                booking.id!,
                "expired",
                { expiredAt: now },
                ["pending_payment"]
            );
            if (expired) {
                booking = expired;
            }
        }

        const isCustomer = booking.userId === userId;
        const [payment, allocation, vehicle, mechanicUser, mechanicApp] =
            await Promise.all([
                isCustomer
                    ? this.paymentRepository.findLatestByBookingId(booking.id!)
                    : Promise.resolve(null),
                this.paymentRepository.findAllocationByBookingId(booking.id!),
                this.vehicleRepository
                    ? this.vehicleRepository.findById(booking.vehicleId)
                    : Promise.resolve(null),
                this.userRepository
                    ? this.userRepository.findById(booking.mechanicId)
                    : Promise.resolve(null),
                this.mechanicApplicationRepository
                    ? this.mechanicApplicationRepository.findByUserId(
                          booking.mechanicId
                      )
                    : Promise.resolve(null),
            ]);

        return {
            bookingId: booking.id!,
            userId: booking.userId,
            mechanicId: booking.mechanicId,
            vehicleId: booking.vehicleId,
            bookingType: booking.bookingType,
            serviceType: booking.serviceType,
            serviceAddress: booking.serviceAddress,
            ...(booking.latitude !== undefined ? { latitude: booking.latitude } : {}),
            ...(booking.longitude !== undefined
                ? { longitude: booking.longitude }
                : {}),
            scheduledDate: booking.scheduledDate,
            slot: booking.slot,
            bookingAmount: booking.bookingAmount,
            status: booking.status,
            ...(booking.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: booking.reservationExpiresAt }
                : {}),
            ...(booking.confirmedAt !== undefined
                ? { confirmedAt: booking.confirmedAt }
                : {}),
            ...(booking.expiredAt !== undefined
                ? { expiredAt: booking.expiredAt }
                : {}),
            ...(booking.createdAt !== undefined
                ? { createdAt: booking.createdAt }
                : {}),
            ...(booking.updatedAt !== undefined
                ? { updatedAt: booking.updatedAt }
                : {}),
            ...(vehicle
                ? {
                      vehicle: {
                          vehicleId: vehicle.id!,
                          brand: vehicle.brand,
                          model: vehicle.model,
                          registrationNumber: vehicle.registrationNumber,
                          vehicleType: vehicle.vehicleType,
                      },
                  }
                : {}),
            ...(mechanicUser
                ? {
                      mechanic: {
                          mechanicId: booking.mechanicId,
                          fullName: mechanicUser.fullName,
                          ...(mechanicApp?.workshopName !== undefined
                              ? { workshopName: mechanicApp.workshopName }
                              : {}),
                          ...(mechanicApp?.serviceModel !== undefined
                              ? { serviceModel: mechanicApp.serviceModel }
                              : {}),
                      },
                  }
                : {}),
            ...(payment
                ? {
                      payment: {
                          paymentId: payment.id!,
                          status: payment.status,
                          razorpayOrderId: payment.razorpayOrderId,
                          ...(payment.razorpayPaymentId !== undefined
                              ? { razorpayPaymentId: payment.razorpayPaymentId }
                              : {}),
                          amount: payment.amount,
                          currency: payment.currency,
                          ...(payment.failureReason !== undefined
                              ? { failureReason: payment.failureReason }
                              : {}),
                          ...(payment.refundId !== undefined
                              ? { refundId: payment.refundId }
                              : {}),
                          ...(payment.paidAt !== undefined
                              ? { paidAt: payment.paidAt }
                              : {}),
                          ...(payment.refundedAt !== undefined
                              ? { refundedAt: payment.refundedAt }
                              : {}),
                      },
                  }
                : {}),
            ...(allocation
                ? {
                      allocation: {
                          id: allocation.id!,
                          totalAmount: allocation.totalAmount,
                          superAdminShare: allocation.superAdminShare,
                          adminShare: allocation.adminShare,
                          mechanicShare: allocation.mechanicShare,
                          currency: allocation.currency,
                          status: allocation.status,
                          ...(allocation.allocatedAt !== undefined
                              ? { allocatedAt: allocation.allocatedAt }
                              : {}),
                      },
                  }
                : {}),
        };
    }
}
