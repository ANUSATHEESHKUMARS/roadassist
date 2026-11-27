import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { BookingStatus } from "../../../domain/User/Types/BookingTypes.js";
import {
    BookingHistoryCategory,
    GetMyBookingsQueryDto,
    GetMyBookingsResponseDto,
    MyBookingItemDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";
import { IGetMyBookingsUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";

const UPCOMING_STATUSES: BookingStatus[] = [
    "pending_payment",
    "pending",
    "accepted",
    "confirmed",
    "in_progress",
];

const COMPLETED_STATUSES: BookingStatus[] = ["completed"];

const CANCELLED_STATUSES: BookingStatus[] = [
    "cancelled",
    "rejected",
    "expired",
];

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export class GetMyBookingsUseCase implements IGetMyBookingsUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly userRepository: IUserRepository,
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly paymentRepository: IPaymentRepository
    ) {}

    async execute(
        userId: string,
        query?: GetMyBookingsQueryDto
    ): Promise<GetMyBookingsResponseDto> {
        const rawPage = Number(query?.page ?? 1);
        const rawLimit = Number(query?.limit ?? DEFAULT_LIMIT);
        const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
        const limit =
            Number.isFinite(rawLimit) && rawLimit >= 1
                ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
                : DEFAULT_LIMIT;

        const category: BookingHistoryCategory =
            query?.category === "upcoming" ||
            query?.category === "completed" ||
            query?.category === "cancelled"
                ? query.category
                : "all";

        // Ensure stale pending_payment reservations reflect expired before listing
        await this.bookingRepository.expireStaleReservations(new Date());

        const filterStatuses: BookingStatus[] | undefined =
            category === "upcoming"
                ? UPCOMING_STATUSES
                : category === "completed"
                  ? COMPLETED_STATUSES
                  : category === "cancelled"
                    ? CANCELLED_STATUSES
                    : undefined;

        const [
            bookings,
            totalAll,
            totalUpcoming,
            totalCompleted,
            totalCancelled,
        ] = await Promise.all([
            this.bookingRepository.findByUserId(userId, page, limit, filterStatuses),
            this.bookingRepository.countByUserId(userId),
            this.bookingRepository.countByUserId(userId, UPCOMING_STATUSES),
            this.bookingRepository.countByUserId(userId, COMPLETED_STATUSES),
            this.bookingRepository.countByUserId(userId, CANCELLED_STATUSES),
        ]);

        const totalForCategory =
            category === "upcoming"
                ? totalUpcoming
                : category === "completed"
                  ? totalCompleted
                  : category === "cancelled"
                    ? totalCancelled
                    : totalAll;

        const totalPages = Math.max(1, Math.ceil(totalForCategory / limit));

        if (bookings.length === 0) {
            return {
                bookings: [],
                pagination: {
                    page,
                    limit,
                    total: totalForCategory,
                    totalPages,
                    hasNextPage: false,
                    hasPrevPage: page > 1,
                },
                counts: {
                    all: totalAll,
                    upcoming: totalUpcoming,
                    completed: totalCompleted,
                    cancelled: totalCancelled,
                },
            };
        }

        const bookingIds = bookings
            .map((b) => b.id)
            .filter((id): id is string => Boolean(id));
        const mechanicIds = [...new Set(bookings.map((b) => b.mechanicId))];

        const [vehicles, mechanicUsers, mechanicApps, paymentMap] =
            await Promise.all([
                this.vehicleRepository.findByUserId(userId),
                this.userRepository.findByIds(mechanicIds),
                this.mechanicApplicationRepository.findByUserIds(mechanicIds),
                this.paymentRepository.findLatestByBookingIds(bookingIds),
            ]);

        const vehicleMap = new Map(
            vehicles.filter((v) => v.id).map((v) => [v.id!, v])
        );
        const mechanicUserMap = new Map(
            mechanicUsers.filter((u) => u.userId).map((u) => [u.userId!, u])
        );
        const mechanicAppMap = new Map(
            mechanicApps.map((app) => [app.userId, app])
        );

        const items: MyBookingItemDto[] = bookings.map((booking) => {
            const vehicle = vehicleMap.get(booking.vehicleId);
            const mechanicUser = mechanicUserMap.get(booking.mechanicId);
            const mechanicApp = mechanicAppMap.get(booking.mechanicId);
            const payment = booking.id ? paymentMap.get(booking.id) : undefined;

            return {
                bookingId: booking.id!,
                bookingType: booking.bookingType,
                serviceType: booking.serviceType,
                serviceAddress: booking.serviceAddress,
                scheduledDate: booking.scheduledDate,
                slot: booking.slot,
                bookingAmount: booking.bookingAmount,
                status: booking.status,
                ...(payment !== undefined
                    ? { paymentStatus: payment.status }
                    : {}),
                ...(booking.reservationExpiresAt !== undefined
                    ? { reservationExpiresAt: booking.reservationExpiresAt }
                    : {}),
                ...(booking.confirmedAt !== undefined
                    ? { confirmedAt: booking.confirmedAt }
                    : {}),
                ...(booking.createdAt !== undefined
                    ? { createdAt: booking.createdAt }
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
            };
        });

        return {
            bookings: items,
            pagination: {
                page,
                limit,
                total: totalForCategory,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            counts: {
                all: totalAll,
                upcoming: totalUpcoming,
                completed: totalCompleted,
                cancelled: totalCancelled,
            },
        };
    }
}

