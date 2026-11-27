import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { getIndiaDayKey } from "../../../shared/utils/timezone.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { BookingDetailsResponseDto } from "../../dtos/booking/ScheduledBookingDtos.js";
import { IGetBookingDetailsUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingEnrichmentHelper } from "../../services/BookingEnrichmentHelper.js";
import { BookingValidator } from "../../validators/BookingValidator.js";

const MECHANIC_VISIBLE_PAYMENT_STATUSES = new Set([
    "paid",
    "refunded",
    "partially_refunded",
]);

export class GetBookingDetailsUseCase implements IGetBookingDetailsUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly vehicleRepository?: IVehicleRepository,
        private readonly userRepository?: IUserRepository,
        private readonly mechanicApplicationRepository?: IMechanicApplicationRepository,
        private readonly mechanicScheduleRepository?: IMechanicScheduleRepository,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository,
        private readonly fileStorageService?: IFileStorageService
    ) {}

    async execute(
        userId: string,
        bookingId: string,
        expectedRole?: "user" | "mechanic"
    ): Promise<BookingDetailsResponseDto> {
        const validBookingId = BookingValidator.validateNonEmptyString(
            bookingId,
            "Booking ID"
        );

        let booking = await this.bookingRepository.findById(validBookingId);
        if (!booking) {
            throw new NotfoundError("Booking not found", "BOOKING_NOT_FOUND");
        }

        const isBookingCustomer = booking.userId === userId;
        const isAssignedMechanic = booking.mechanicId === userId;

        if (!isBookingCustomer && !isAssignedMechanic) {
            throw new ForbiddenError(
                "You are not authorized to view this booking",
                "BOOKING_FORBIDDEN"
            );
        }

        if (expectedRole === "mechanic" && !isAssignedMechanic) {
            throw new ForbiddenError(
                "You are not authorized to view this booking as mechanic",
                "BOOKING_FORBIDDEN"
            );
        }

        if (expectedRole === "user" && !isBookingCustomer) {
            throw new ForbiddenError(
                "You are not authorized to view this booking as customer",
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

        const viewingAsCustomer =
            expectedRole === "mechanic" ? false : isBookingCustomer;

        const [
            payment,
            allocation,
            vehicle,
            customerUser,
            mechanicUser,
            mechanicApp,
            mechanicSchedule,
            categories,
        ] = await Promise.all([
            this.paymentRepository.findLatestByBookingId(booking.id!),
            this.paymentRepository.findAllocationByBookingId(booking.id!),
            this.vehicleRepository
                ? this.vehicleRepository.findById(booking.vehicleId)
                : Promise.resolve(null),
            this.userRepository
                ? this.userRepository.findById(booking.userId)
                : Promise.resolve(null),
            this.userRepository
                ? this.userRepository.findById(booking.mechanicId)
                : Promise.resolve(null),
            this.mechanicApplicationRepository
                ? this.mechanicApplicationRepository.findByUserId(
                      booking.mechanicId
                  )
                : Promise.resolve(null),
            this.mechanicScheduleRepository
                ? this.mechanicScheduleRepository.findByMechanicId(
                      booking.mechanicId
                  )
                : Promise.resolve(null),
            this.mechanicCategoryRepository
                ? this.mechanicCategoryRepository.findAll(true)
                : Promise.resolve([]),
        ]);

        const vehicleSummary = vehicle
            ? await BookingEnrichmentHelper.buildVehicleSummary(
                  vehicle,
                  this.fileStorageService
              )
            : undefined;

        const serviceCategory = BookingEnrichmentHelper.resolveServiceCategory(
            booking.serviceType,
            categories
        );

        const scheduleTimings = BookingEnrichmentHelper.resolveScheduleTimings(
            mechanicSchedule,
            booking.scheduledDate,
            booking.slot
        );

        const shouldIncludePayment = Boolean(
            payment &&
                (viewingAsCustomer ||
                    MECHANIC_VISIBLE_PAYMENT_STATUSES.has(payment.status))
        );

        return {
            bookingId: booking.id!,
            bookingReference: BookingEnrichmentHelper.formatBookingReference(
                booking.id!
            ),
            userId: booking.userId,
            mechanicId: booking.mechanicId,
            vehicleId: booking.vehicleId,
            bookingType: booking.bookingType,
            serviceType: booking.serviceType,
            ...(serviceCategory ? { serviceCategory } : {}),
            ...(booking.problemDescription !== undefined
                ? { problemDescription: booking.problemDescription }
                : {}),
            serviceAddress: booking.serviceAddress,
            ...(booking.latitude !== undefined ? { latitude: booking.latitude } : {}),
            ...(booking.longitude !== undefined
                ? { longitude: booking.longitude }
                : {}),
            scheduledDate: booking.scheduledDate,
            scheduledDateDayKey: getIndiaDayKey(booking.scheduledDate),
            slot: booking.slot,
            ...(scheduleTimings ? { scheduleTimings } : {}),
            bookingAmount: booking.bookingAmount,
            status: booking.status,
            ...(booking.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: booking.reservationExpiresAt }
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
            ...(booking.createdAt !== undefined
                ? { createdAt: booking.createdAt }
                : {}),
            ...(booking.updatedAt !== undefined
                ? { updatedAt: booking.updatedAt }
                : {}),
            ...(customerUser
                ? {
                      customer:
                          BookingEnrichmentHelper.buildCustomerSummary(
                              customerUser
                          ),
                  }
                : {}),
            ...(vehicleSummary ? { vehicle: vehicleSummary } : {}),
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
            ...(shouldIncludePayment && payment
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
                          ...(viewingAsCustomer && payment.failureReason !== undefined
                              ? { failureReason: payment.failureReason }
                              : {}),
                          ...(viewingAsCustomer && payment.refundId !== undefined
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
