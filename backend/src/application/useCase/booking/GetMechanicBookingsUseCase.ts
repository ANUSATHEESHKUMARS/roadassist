import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";
import {
    IBookingRepository,
    MechanicBookingFilterOption,
    MechanicBookingSortOption,
} from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IPaymentRepository } from "../../../domain/repositories/IPaymentRepository.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { getIndiaDayKey, isValidDateKey } from "../../../shared/utils/timezone.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import {
    GetMechanicBookingsQueryDto,
    GetMechanicBookingsResponseDto,
    MechanicBookingItemDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";
import { IGetMechanicBookingsUseCase } from "../../interfaces/booking/IScheduledBookingUseCases.js";
import { BookingEnrichmentHelper } from "../../services/BookingEnrichmentHelper.js";

const VALID_FILTERS: MechanicBookingFilterOption[] = [
    "all",
    "upcoming",
    "today",
    "in_progress",
    "completed",
    "cancelled",
];

const VALID_SORTS: MechanicBookingSortOption[] = ["upcoming", "newest"];

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export class GetMechanicBookingsUseCase implements IGetMechanicBookingsUseCase {
    constructor(
        private readonly bookingRepository: IBookingRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly userRepository: IUserRepository,
        private readonly paymentRepository: IPaymentRepository,
        private readonly mechanicScheduleRepository?: IMechanicScheduleRepository,
        private readonly mechanicCategoryRepository?: IMechanicCategoryRepository,
        private readonly fileStorageService?: IFileStorageService
    ) {}

    async execute(
        mechanicId: string,
        query?: GetMechanicBookingsQueryDto
    ): Promise<GetMechanicBookingsResponseDto> {
        const rawPage = Number(query?.page ?? 1);
        const rawLimit = Number(query?.limit ?? DEFAULT_LIMIT);
        const page =
            Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1;
        const limit =
            Number.isFinite(rawLimit) && rawLimit >= 1
                ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
                : DEFAULT_LIMIT;

        const filter: MechanicBookingFilterOption = VALID_FILTERS.includes(
            query?.filter as MechanicBookingFilterOption
        )
            ? (query!.filter as MechanicBookingFilterOption)
            : "all";

        const sort: MechanicBookingSortOption = VALID_SORTS.includes(
            query?.sort as MechanicBookingSortOption
        )
            ? (query!.sort as MechanicBookingSortOption)
            : filter === "completed" || filter === "cancelled"
              ? "newest"
              : "upcoming";

        const search =
            typeof query?.search === "string" && query.search.trim().length > 0
                ? query.search.trim()
                : undefined;

        const serviceType =
            typeof query?.serviceType === "string" &&
            query.serviceType.trim().length > 0 &&
            query.serviceType.trim().toLowerCase() !== "all"
                ? query.serviceType.trim()
                : undefined;

        let dateKey: string | undefined;
        if (typeof query?.date === "string" && query.date.trim().length > 0) {
            const candidateDate = query.date.trim();
            if (!isValidDateKey(candidateDate)) {
                throw new BadRequest(
                    "Invalid date filter format. Use YYYY-MM-DD",
                    "INVALID_DATE_KEY"
                );
            }
            dateKey = candidateDate;
        }

        const now = new Date();
        const matchingCustomerIds = search
            ? await this.userRepository.findIdsByNameSearch(search)
            : undefined;

        const [{ bookings, total }, counts] = await Promise.all([
            this.bookingRepository.findMechanicBookings({
                mechanicId,
                page,
                limit,
                filter,
                ...(search !== undefined ? { search } : {}),
                ...(matchingCustomerIds !== undefined
                    ? { matchingCustomerIds }
                    : {}),
                ...(dateKey !== undefined ? { dateKey } : {}),
                ...(serviceType !== undefined ? { serviceType } : {}),
                sort,
                now,
            }),
            this.bookingRepository.getMechanicBookingCounts(mechanicId, now),
        ]);

        const vehicleIds = Array.from(
            new Set(bookings.map((b) => b.vehicleId).filter(Boolean))
        );
        const customerIds = Array.from(
            new Set(bookings.map((b) => b.userId).filter(Boolean))
        );
        const bookingIds = bookings
            .map((b) => b.id)
            .filter((id): id is string => Boolean(id));

        const [vehicles, customers, paymentMap, schedule, categories] =
            await Promise.all([
                vehicleIds.length > 0
                    ? this.vehicleRepository.findByIds(vehicleIds)
                    : Promise.resolve([]),
                customerIds.length > 0
                    ? this.userRepository.findByIds(customerIds)
                    : Promise.resolve([]),
                bookingIds.length > 0
                    ? this.paymentRepository.findLatestByBookingIds(bookingIds)
                    : Promise.resolve(new Map()),
                this.mechanicScheduleRepository
                    ? this.mechanicScheduleRepository.findByMechanicId(
                          mechanicId
                      )
                    : Promise.resolve(null),
                this.mechanicCategoryRepository
                    ? this.mechanicCategoryRepository.findAll(true)
                    : Promise.resolve([]),
            ]);

        const vehicleSummaryEntries = await Promise.all(
            vehicles
                .filter((v) => Boolean(v.id))
                .map(async (v) => [
                    v.id!,
                    await BookingEnrichmentHelper.buildVehicleSummary(
                        v,
                        this.fileStorageService
                    ),
                ] as const)
        );

        const vehicleMap = new Map(vehicleSummaryEntries);
        const customerMap = new Map(
            customers
                .filter((u) => Boolean(u.userId))
                .map((u) => [
                    u.userId!,
                    BookingEnrichmentHelper.buildCustomerSummary(u),
                ])
        );

        const items: MechanicBookingItemDto[] = bookings.map((booking) => {
            const vehicle = vehicleMap.get(booking.vehicleId);
            const customer = customerMap.get(booking.userId);
            const payment = booking.id ? paymentMap.get(booking.id) : undefined;
            const serviceCategory =
                BookingEnrichmentHelper.resolveServiceCategory(
                    booking.serviceType,
                    categories
                );
            const scheduleTimings =
                BookingEnrichmentHelper.resolveScheduleTimings(
                    schedule,
                    booking.scheduledDate,
                    booking.slot
                );

            const paymentStatus =
                payment &&
                ["paid", "refunded", "partially_refunded"].includes(
                    payment.status
                )
                    ? payment.status
                    : undefined;

            return {
                bookingId: booking.id!,
                bookingReference: BookingEnrichmentHelper.formatBookingReference(
                    booking.id!
                ),
                userId: booking.userId,
                vehicleId: booking.vehicleId,
                bookingType: booking.bookingType,
                serviceType: booking.serviceType,
                ...(serviceCategory ? { serviceCategory } : {}),
                ...(booking.problemDescription !== undefined
                    ? { problemDescription: booking.problemDescription }
                    : {}),
                serviceAddress: booking.serviceAddress,
                ...(booking.latitude !== undefined
                    ? { latitude: booking.latitude }
                    : {}),
                ...(booking.longitude !== undefined
                    ? { longitude: booking.longitude }
                    : {}),
                scheduledDate: booking.scheduledDate,
                scheduledDateDayKey: getIndiaDayKey(booking.scheduledDate),
                slot: booking.slot,
                ...(scheduleTimings ? { scheduleTimings } : {}),
                bookingAmount: booking.bookingAmount,
                status: booking.status,
                ...(paymentStatus !== undefined ? { paymentStatus } : {}),
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
                ...(booking.createdAt !== undefined
                    ? { createdAt: booking.createdAt }
                    : {}),
                ...(customer ? { customer } : {}),
                ...(vehicle ? { vehicle } : {}),
            };
        });

        const totalPages = Math.max(1, Math.ceil(total / limit));

        return {
            bookings: items,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
            counts,
        };
    }
}

