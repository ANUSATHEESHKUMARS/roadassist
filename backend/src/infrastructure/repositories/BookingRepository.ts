import { Types } from "mongoose";
import { BookingMapper } from "../../application/mappers/BookingMapper.js";
import {
    FindMechanicBookingsCriteria,
    IBookingRepository,
    MechanicBookingCounts,
} from "../../domain/repositories/IBookingRepository.js";
import { Booking, BookingProps } from "../../domain/User/entities/Booking.js";
import { BookingSlot, BookingStatus } from "../../domain/User/Types/BookingTypes.js";
import { ConflictError } from "../../shared/errors/ConflitError.js";
import {
    getIndiaDayRange,
    parseIndiaDateKeyToDate,
} from "../../shared/utils/timezone.js";
import { ITransactionContext } from "../databases/interface/ITransactionContext.js";
import { BookingModel } from "../databases/models/BookingModel.js";
import { MongoTransactionContext } from "../databases/MongoTransactionContext.js";

const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
    "pending",
    "accepted",
    "confirmed",
    "in_progress",
];

const MECHANIC_VISIBLE_BOOKING_STATUSES: BookingStatus[] = [
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
];

function escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export class BookingRepository implements IBookingRepository {
    private getSession(transaction?: ITransactionContext) {
        return transaction instanceof MongoTransactionContext
            ? transaction.session
            : undefined;
    }

    async create(
        booking: Booking,
        transaction?: ITransactionContext
    ): Promise<Booking> {
        const bookingData = BookingMapper.toPersistence(booking);
        const session = this.getSession(transaction);

        try {
            if (session) {
                const [createdBooking] = await BookingModel.create([bookingData], {
                    session,
                });
                if (!createdBooking) {
                    throw new Error("Failed to create booking");
                }
                return BookingMapper.toDomain(createdBooking);
            }

            const createdBooking = await BookingModel.create(bookingData);
            return BookingMapper.toDomain(createdBooking);
        } catch (error: unknown) {
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                (error as { code?: number }).code === 11000
            ) {
                throw new ConflictError(
                    "This mechanic is already booked or reserved for the selected slot",
                    "SLOT_ALREADY_RESERVED"
                );
            }
            throw error;
        }
    }

    async findById(
        bookingId: string,
        transaction?: ITransactionContext
    ): Promise<Booking | null> {
        if (!Types.ObjectId.isValid(bookingId)) {
            return null;
        }
        const session = this.getSession(transaction);
        const query = BookingModel.findById(bookingId);
        if (session) {
            query.session(session);
        }
        const booking = await query.exec();

        if (!booking) {
            return null;
        }

        return BookingMapper.toDomain(booking);
    }

    async findByIdAndUserId(
        bookingId: string,
        userId: string
    ): Promise<Booking | null> {
        if (!Types.ObjectId.isValid(bookingId) || !Types.ObjectId.isValid(userId)) {
            return null;
        }
        const booking = await BookingModel.findOne({
            _id: new Types.ObjectId(bookingId),
            userId: new Types.ObjectId(userId),
        }).exec();

        if (!booking) {
            return null;
        }

        return BookingMapper.toDomain(booking);
    }

    async findByUserId(
        userId: string,
        page: number,
        limit: number,
        statuses?: BookingStatus[]
    ): Promise<Booking[]> {
        const skip = (page - 1) * limit;
        const filter: Record<string, unknown> = { userId };
        if (statuses && statuses.length > 0) {
            filter.status = { $in: statuses };
        }

        const bookings = await BookingModel.find(filter)
            .sort({ scheduledDate: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();

        return bookings.map((booking) => BookingMapper.toDomain(booking));
    }

    async countByUserId(
        userId: string,
        statuses?: BookingStatus[]
    ): Promise<number> {
        const filter: Record<string, unknown> = { userId };
        if (statuses && statuses.length > 0) {
            filter.status = { $in: statuses };
        }
        return BookingModel.countDocuments(filter).exec();
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

        return bookings.map((booking) => BookingMapper.toDomain(booking));
    }

    async findMechanicBookings(
        criteria: FindMechanicBookingsCriteria
    ): Promise<{ bookings: Booking[]; total: number }> {
        if (!Types.ObjectId.isValid(criteria.mechanicId)) {
            return { bookings: [], total: 0 };
        }

        const now = criteria.now ?? new Date();
        const { startOfDay: todayStart, endOfDay: todayEnd } =
            getIndiaDayRange(now);
        const conditions: Record<string, unknown>[] = [
            { mechanicId: new Types.ObjectId(criteria.mechanicId) },
            { bookingType: "scheduled" },
        ];

        switch (criteria.filter ?? "all") {
            case "upcoming":
                conditions.push({ status: "confirmed" });
                conditions.push({ scheduledDate: { $gte: todayStart } });
                break;
            case "today":
                conditions.push({
                    status: { $in: ["confirmed", "in_progress", "completed"] },
                });
                conditions.push({
                    scheduledDate: { $gte: todayStart, $lt: todayEnd },
                });
                break;
            case "in_progress":
                conditions.push({ status: "in_progress" });
                break;
            case "completed":
                conditions.push({ status: "completed" });
                break;
            case "cancelled":
                conditions.push({ status: "cancelled" });
                break;
            default:
                conditions.push({
                    status: { $in: MECHANIC_VISIBLE_BOOKING_STATUSES },
                });
                break;
        }

        if (criteria.dateKey) {
            const { startOfDay, endOfDay } = getIndiaDayRange(
                parseIndiaDateKeyToDate(criteria.dateKey)
            );
            conditions.push({
                scheduledDate: { $gte: startOfDay, $lt: endOfDay },
            });
        }

        if (criteria.serviceType && criteria.serviceType.trim().length > 0) {
            const escapedService = escapeRegex(criteria.serviceType.trim());
            conditions.push({
                serviceType: { $regex: escapedService, $options: "i" },
            });
        }

        if (criteria.search && criteria.search.trim().length > 0) {
            const searchOr: Record<string, unknown>[] = [];
            const validCustomerIds = (criteria.matchingCustomerIds ?? [])
                .filter((id) => Types.ObjectId.isValid(id))
                .map((id) => new Types.ObjectId(id));

            if (validCustomerIds.length > 0) {
                searchOr.push({ userId: { $in: validCustomerIds } });
            }

            const normalizedIdSearch = criteria.search
                .trim()
                .replace(/^(?:#|bk-)/i, "")
                .trim();

            if (Types.ObjectId.isValid(normalizedIdSearch)) {
                searchOr.push({
                    _id: new Types.ObjectId(normalizedIdSearch),
                });
            } else if (normalizedIdSearch.length > 0) {
                searchOr.push({
                    $expr: {
                        $regexMatch: {
                            input: { $toString: "$_id" },
                            regex: escapeRegex(normalizedIdSearch),
                            options: "i",
                        },
                    },
                });
            }

            if (searchOr.length === 0) {
                return { bookings: [], total: 0 };
            }

            conditions.push({ $or: searchOr });
        }

        const mongoFilter = { $and: conditions };
        const sortOption: Record<string, 1 | -1> =
            criteria.sort === "newest"
                ? { createdAt: -1, scheduledDate: -1 }
                : { scheduledDate: 1, createdAt: 1 };

        const skip = (criteria.page - 1) * criteria.limit;

        const [documents, total] = await Promise.all([
            BookingModel.find(mongoFilter)
                .sort(sortOption)
                .skip(skip)
                .limit(criteria.limit)
                .exec(),
            BookingModel.countDocuments(mongoFilter).exec(),
        ]);

        return {
            bookings: documents.map((doc) => BookingMapper.toDomain(doc)),
            total,
        };
    }

    async getMechanicBookingCounts(
        mechanicId: string,
        now: Date = new Date()
    ): Promise<MechanicBookingCounts> {
        if (!Types.ObjectId.isValid(mechanicId)) {
            return {
                total: 0,
                upcoming: 0,
                today: 0,
                inProgress: 0,
                completed: 0,
                cancelled: 0,
            };
        }

        const mechObjectId = new Types.ObjectId(mechanicId);
        const { startOfDay: todayStart, endOfDay: todayEnd } =
            getIndiaDayRange(now);
        const baseMatch = {
            mechanicId: mechObjectId,
            bookingType: "scheduled" as const,
        };

        const [total, upcoming, today, inProgress, completed, cancelled] =
            await Promise.all([
                BookingModel.countDocuments({
                    ...baseMatch,
                    status: { $in: MECHANIC_VISIBLE_BOOKING_STATUSES },
                }).exec(),
                BookingModel.countDocuments({
                    ...baseMatch,
                    status: "confirmed",
                    scheduledDate: { $gte: todayStart },
                }).exec(),
                BookingModel.countDocuments({
                    ...baseMatch,
                    status: { $in: ["confirmed", "in_progress", "completed"] },
                    scheduledDate: { $gte: todayStart, $lt: todayEnd },
                }).exec(),
                BookingModel.countDocuments({
                    ...baseMatch,
                    status: "in_progress",
                }).exec(),
                BookingModel.countDocuments({
                    ...baseMatch,
                    status: "completed",
                }).exec(),
                BookingModel.countDocuments({
                    ...baseMatch,
                    status: "cancelled",
                }).exec(),
            ]);

        return {
            total,
            upcoming,
            today,
            inProgress,
            completed,
            cancelled,
        };
    }

    async findConflictingBooking(
        mechanicId: string,
        scheduledDate: Date,
        slot: BookingSlot,
        excludeBookingId?: string,
        transaction?: ITransactionContext
    ): Promise<Booking | null> {
        const { startOfDay, endOfDay } = getIndiaDayRange(scheduledDate);
        const now = new Date();

        const conflictingSlots: BookingSlot[] =
            slot === "full_day"
                ? ["morning", "afternoon", "full_day"]
                : [slot, "full_day"];

        const filter: Record<string, unknown> = {
            mechanicId,
            scheduledDate: {
                $gte: startOfDay,
                $lt: endOfDay,
            },
            slot: {
                $in: conflictingSlots,
            },
            $or: [
                { status: { $in: ACTIVE_BOOKING_STATUSES } },
                {
                    status: "pending_payment",
                    reservationExpiresAt: { $gt: now },
                },
            ],
        };

        if (excludeBookingId && Types.ObjectId.isValid(excludeBookingId)) {
            filter._id = { $ne: new Types.ObjectId(excludeBookingId) };
        }

        const session = this.getSession(transaction);
        const query = BookingModel.findOne(filter);
        if (session) {
            query.session(session);
        }

        const booking = await query.exec();
        if (!booking) {
            return null;
        }

        return BookingMapper.toDomain(booking);
    }

    async findConflictingMechanicIds(
        mechanicIds: string[],
        scheduledDate: Date,
        slot: BookingSlot
    ): Promise<Set<string>> {
        if (mechanicIds.length === 0) {
            return new Set<string>();
        }

        const { startOfDay, endOfDay } = getIndiaDayRange(scheduledDate);
        const now = new Date();

        const conflictingSlots: BookingSlot[] =
            slot === "full_day"
                ? ["morning", "afternoon", "full_day"]
                : [slot, "full_day"];

        const objectIds = mechanicIds
            .filter((id) => Types.ObjectId.isValid(id))
            .map((id) => new Types.ObjectId(id));

        if (objectIds.length === 0) {
            return new Set<string>();
        }

        const conflicts = await BookingModel.find(
            {
                mechanicId: { $in: objectIds },
                scheduledDate: {
                    $gte: startOfDay,
                    $lt: endOfDay,
                },
                slot: { $in: conflictingSlots },
                $or: [
                    { status: { $in: ACTIVE_BOOKING_STATUSES } },
                    {
                        status: "pending_payment",
                        reservationExpiresAt: { $gt: now },
                    },
                ],
            },
            { mechanicId: 1 }
        ).exec();

        return new Set(conflicts.map((doc) => doc.mechanicId.toString()));
    }

    async findActiveScheduledBookingsByMechanic(
        mechanicId: string,
        startDate: Date,
        endDate?: Date
    ): Promise<Booking[]> {
        if (!Types.ObjectId.isValid(mechanicId)) {
            return [];
        }

        const now = new Date();
        const dateFilter: Record<string, Date> = {
            $gte: startDate,
            ...(endDate !== undefined ? { $lt: endDate } : {}),
        };

        const bookings = await BookingModel.find({
            mechanicId: new Types.ObjectId(mechanicId),
            bookingType: "scheduled",
            scheduledDate: dateFilter,
            $or: [
                { status: { $in: ACTIVE_BOOKING_STATUSES } },
                {
                    status: "pending_payment",
                    reservationExpiresAt: { $gt: now },
                },
            ],
        })
            .sort({ scheduledDate: 1 })
            .exec();

        return bookings.map((booking) => BookingMapper.toDomain(booking));
    }

    async updateStatus(
        bookingId: string,
        status: BookingStatus,
        additionalFields?: Partial<BookingProps>,
        expectedCurrentStatuses?: BookingStatus[],
        transaction?: ITransactionContext
    ): Promise<Booking | null> {
        if (!Types.ObjectId.isValid(bookingId)) {
            return null;
        }

        const filter: Record<string, unknown> = {
            _id: new Types.ObjectId(bookingId),
        };
        if (expectedCurrentStatuses && expectedCurrentStatuses.length > 0) {
            filter.status = { $in: expectedCurrentStatuses };
        }

        const updateFields: Record<string, unknown> = {
            status,
            ...(additionalFields?.paymentId !== undefined
                ? { paymentId: new Types.ObjectId(additionalFields.paymentId) }
                : {}),
            ...(additionalFields?.confirmedAt !== undefined
                ? { confirmedAt: additionalFields.confirmedAt }
                : {}),
            ...(additionalFields?.startedAt !== undefined
                ? { startedAt: additionalFields.startedAt }
                : {}),
            ...(additionalFields?.completedAt !== undefined
                ? { completedAt: additionalFields.completedAt }
                : {}),
            ...(additionalFields?.cancelledAt !== undefined
                ? { cancelledAt: additionalFields.cancelledAt }
                : {}),
            ...(additionalFields?.expiredAt !== undefined
                ? { expiredAt: additionalFields.expiredAt }
                : {}),
            ...(additionalFields?.reservationExpiresAt !== undefined
                ? { reservationExpiresAt: additionalFields.reservationExpiresAt }
                : {}),
        };

        const session = this.getSession(transaction);
        const updated = await BookingModel.findOneAndUpdate(
            filter,
            { $set: updateFields },
            {
                new: true,
                runValidators: true,
                ...(session ? { session } : {}),
            }
        ).exec();

        if (!updated) {
            return null;
        }

        return BookingMapper.toDomain(updated);
    }

    async attachPaymentId(
        bookingId: string,
        paymentId: string,
        transaction?: ITransactionContext
    ): Promise<Booking | null> {
        if (!Types.ObjectId.isValid(bookingId) || !Types.ObjectId.isValid(paymentId)) {
            return null;
        }

        const session = this.getSession(transaction);
        const updated = await BookingModel.findByIdAndUpdate(
            bookingId,
            { $set: { paymentId: new Types.ObjectId(paymentId) } },
            {
                new: true,
                ...(session ? { session } : {}),
            }
        ).exec();

        if (!updated) {
            return null;
        }

        return BookingMapper.toDomain(updated);
    }

    async expireStaleReservations(now: Date = new Date()): Promise<number> {
        const result = await BookingModel.updateMany(
            {
                status: "pending_payment",
                reservationExpiresAt: { $lte: now },
            },
            {
                $set: {
                    status: "expired",
                    expiredAt: now,
                },
            }
        ).exec();

        return result.modifiedCount;
    }
}
