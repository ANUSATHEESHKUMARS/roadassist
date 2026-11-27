import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { User } from "../src/domain/User/entities/User.js";
import { Vehicle } from "../src/domain/vehilce/Vehilce.js";
import { MechanicApplication } from "../src/domain/User/entities/MechanicApplication.js";
import { MechanicCategory } from "../src/domain/User/entities/MechanicCategory.js";
import { MechanicSchedule } from "../src/domain/User/entities/MechanicSchedule.js";
import { Booking, BookingProps } from "../src/domain/User/entities/Booking.js";
import { Payment, PaymentProps } from "../src/domain/User/entities/Payment.js";
import { PaymentAllocation } from "../src/domain/User/entities/PaymentAllocation.js";
import {
    BookingSlot,
    BookingStatus,
    PaymentStatus,
} from "../src/domain/User/Types/BookingTypes.js";

import { IUserRepository } from "../src/domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../src/domain/repositories/IVehicleRepository.js";
import { IMechanicApplicationRepository } from "../src/domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../src/domain/repositories/IMechanicScheduleRepository.js";
import { IMechanicCategoryRepository } from "../src/domain/repositories/admin/IMechanicCategoryRepository.js";
import {
    FindMechanicBookingsCriteria,
    IBookingRepository,
} from "../src/domain/repositories/IBookingRepository.js";
import { IPaymentRepository } from "../src/domain/repositories/IPaymentRepository.js";
import { IFileStorageService } from "../src/application/contracts/IFileStorageService.js";
import { ITransactionManager } from "../src/infrastructure/databases/interface/IMongoTransactionManger.js";
import { ITransactionContext } from "../src/infrastructure/databases/interface/ITransactionContext.js";
import {
    CreateOrderInput,
    CreateOrderResult,
    FetchPaymentResult,
    IPaymentGateway,
    RefundPaymentInput,
    RefundPaymentResult,
    VerifySignatureInput,
} from "../src/application/contracts/IPaymentGateway.js";

import { CreateBookingReservationUseCase } from "../src/application/useCase/booking/CreateBookingReservationUseCase.js";
import { CreatePaymentOrderUseCase } from "../src/application/useCase/booking/CreatePaymentOrderUseCase.js";
import { PaymentSettlementHelper } from "../src/application/useCase/booking/PaymentSettlementHelper.js";
import { VerifyPaymentUseCase } from "../src/application/useCase/booking/VerifyPaymentUseCase.js";
import { GetBookingDetailsUseCase } from "../src/application/useCase/booking/GetBookingDetailsUseCase.js";
import { GetMechanicBookingsUseCase } from "../src/application/useCase/booking/GetMechanicBookingsUseCase.js";
import { StartMechanicBookingUseCase } from "../src/application/useCase/booking/StartMechanicBookingUseCase.js";
import { CompleteMechanicBookingUseCase } from "../src/application/useCase/booking/CompleteMechanicBookingUseCase.js";
import { BookingMapper } from "../src/application/mappers/BookingMapper.js";
import {
    getIndiaDateParts,
    getIndiaDayKey,
    getIndiaDayRange,
    parseIndiaDateKeyToDate,
} from "../src/shared/utils/timezone.js";

const WEBHOOK_SECRET = "test_secret";

class FakeTransactionManager implements ITransactionManager {
    async execute<T>(work: (context: ITransactionContext) => Promise<T>): Promise<T> {
        return work({});
    }
}

class MockPaymentGateway implements IPaymentGateway {
    private lastOrderId = "order_mock";

    getKeyId() {
        return "rzp_test_mechanic";
    }
    async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
        this.lastOrderId = `order_${input.receipt}`;
        return {
            orderId: this.lastOrderId,
            amount: input.amountPaise,
            currency: input.currency,
            receipt: input.receipt,
            status: "created",
        };
    }
    verifyPaymentSignature(input: VerifySignatureInput): boolean {
        return input.signature.startsWith("sig_valid_");
    }
    verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
        const expected = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");
        return expected === signature;
    }
    async fetchPayment(paymentId: string): Promise<FetchPaymentResult> {
        return {
            paymentId,
            orderId: this.lastOrderId,
            amount: 80000,
            currency: "INR",
            status: "captured",
            captured: true,
        };
    }
    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
        return {
            refundId: `rfnd_${input.paymentId}`,
            paymentId: input.paymentId,
            amount: Math.round((input.amountPaise ?? 80000) / 100),
            status: "processed",
        };
    }
}

function getDateKeyOffset(offsetDays: number): string {
    const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
    return getIndiaDayKey(d);
}

function createHarness() {
    const users = new Map<string, User>();
    const vehicles = new Map<string, Vehicle>();
    const applications = new Map<string, MechanicApplication>();
    const schedules = new Map<string, MechanicSchedule>();
    const categories = new Map<string, MechanicCategory>();
    const bookings = new Map<string, Booking>();
    const payments = new Map<string, Payment>();
    const allocations = new Map<string, PaymentAllocation>();
    let seq = 1;
    const nextHexId = () => `67a1b2c3d4e5f6000000${String(seq++).padStart(4, "0")}`;

    const userRepo: IUserRepository = {
        async save(u) {
            return u;
        },
        async findbyemail() {
            return null;
        },
        async findAll() {
            return [...users.values()];
        },
        async createGoogleUser() {
            throw new Error("not implemented");
        },
        async findById(id) {
            return users.get(id) ?? null;
        },
        async updateStatus() {
            return null;
        },
        async updatePassword() {
            return null;
        },
        async addRole() {
            return null;
        },
        async updateActiveRole() {
            return null;
        },
        async findByIds(ids) {
            return ids.map((id) => users.get(id)).filter((u): u is User => Boolean(u));
        },
        async findIdsByNameSearch(searchTerm) {
            const q = searchTerm.trim().toLowerCase();
            return [...users.values()]
                .filter((u) => u.fullName.toLowerCase().includes(q))
                .map((u) => u.userId!)
                .filter(Boolean);
        },
    };

    const vehicleRepo: IVehicleRepository = {
        async create(v) {
            return v;
        },
        async findByUserId(userId) {
            return [...vehicles.values()].filter((v) => v.userId === userId);
        },
        async findById(id) {
            return vehicles.get(id) ?? null;
        },
        async findByIds(ids) {
            return ids.map((id) => vehicles.get(id)).filter((v): v is Vehicle => Boolean(v));
        },
        async update() {
            return null;
        },
        async delete() {
            return false;
        },
    };

    const appRepo: IMechanicApplicationRepository = {
        async create(a) {
            return a;
        },
        async findById(id) {
            return [...applications.values()].find((a) => a.id === id) ?? null;
        },
        async findByUserId(userId) {
            return applications.get(userId) ?? null;
        },
        async update() {
            return null;
        },
        async findByStatus(status) {
            return [...applications.values()].filter((a) => a.status === status);
        },
        async findByUserIds(ids) {
            return ids
                .map((id) => applications.get(id))
                .filter((a): a is MechanicApplication => Boolean(a));
        },
        async updateServiceLocation() {
            return null;
        },
    };

    const scheduleRepo: IMechanicScheduleRepository = {
        async create(s) {
            return s;
        },
        async findByMechanicId(id) {
            return schedules.get(id) ?? null;
        },
        async update() {
            return null;
        },
        async findActiveByMechanicIds(ids) {
            return ids
                .map((id) => schedules.get(id))
                .filter((s): s is MechanicSchedule => Boolean(s && s.isActive));
        },
    };

    const categoryRepo: IMechanicCategoryRepository = {
        async create(c) {
            return c;
        },
        async findById(id) {
            return categories.get(id) ?? null;
        },
        async findBySlug(slug) {
            return [...categories.values()].find((c) => c.slug === slug) ?? null;
        },
        async findAll() {
            return [...categories.values()];
        },
        async update() {
            return null;
        },
        async updateStatus() {
            return null;
        },
    };

    const fileStorage: IFileStorageService = {
        async upload(_file: Buffer, folder: string) {
            return `${folder}/uploaded.jpg`;
        },
        async getUrl(key: string) {
            return `https://signed.s3.local/${key}`;
        },
        async delete() {},
    };

    const isSlotConflict = (a: BookingSlot, b: BookingSlot) => {
        if (a === "full_day" || b === "full_day") return true;
        return a === b;
    };

    const isBookingBlocking = (b: Booking, now: Date) => {
        if (["pending", "accepted", "confirmed", "in_progress"].includes(b.status)) {
            return true;
        }
        if (
            b.status === "pending_payment" &&
            b.reservationExpiresAt &&
            b.reservationExpiresAt > now
        ) {
            return true;
        }
        return false;
    };

    const VISIBLE_STATUSES: BookingStatus[] = [
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
    ];

    const matchesFilterTab = (
        booking: Booking,
        filter: NonNullable<FindMechanicBookingsCriteria["filter"]>,
        now: Date
    ): boolean => {
        const { startOfDay, endOfDay } = getIndiaDayRange(now);
        switch (filter) {
            case "upcoming":
                return (
                    booking.status === "confirmed" &&
                    booking.scheduledDate >= startOfDay
                );
            case "today":
                return (
                    ["confirmed", "in_progress", "completed"].includes(
                        booking.status
                    ) &&
                    booking.scheduledDate >= startOfDay &&
                    booking.scheduledDate < endOfDay
                );
            case "in_progress":
                return booking.status === "in_progress";
            case "completed":
                return booking.status === "completed";
            case "cancelled":
                return booking.status === "cancelled";
            default:
                return VISIBLE_STATUSES.includes(booking.status);
        }
    };

    const bookingRepo: IBookingRepository = {
        async create(booking) {
            const id = booking.id ?? nextHexId();
            const saved = Booking.create({
                ...booking.toObject(),
                id,
                createdAt: booking.createdAt ?? new Date(),
                updatedAt: booking.updatedAt ?? new Date(),
            });
            bookings.set(id, saved);
            return saved;
        },
        async findById(id) {
            return bookings.get(id) ?? null;
        },
        async findByIdAndUserId(id, userId) {
            const b = bookings.get(id);
            return b && b.userId === userId ? b : null;
        },
        async findByUserId(userId, page, limit, statuses) {
            const list = [...bookings.values()].filter(
                (b) =>
                    b.userId === userId &&
                    (!statuses || statuses.length === 0 || statuses.includes(b.status))
            );
            const skip = (page - 1) * limit;
            return list.slice(skip, skip + limit);
        },
        async countByUserId(userId, statuses) {
            return [...bookings.values()].filter(
                (b) =>
                    b.userId === userId &&
                    (!statuses || statuses.length === 0 || statuses.includes(b.status))
            ).length;
        },
        async findByMechanicId(mechanicId) {
            return [...bookings.values()].filter((b) => b.mechanicId === mechanicId);
        },
        async findMechanicBookings(criteria) {
            const now = criteria.now ?? new Date();
            const filter = criteria.filter ?? "all";
            let list = [...bookings.values()].filter(
                (b) =>
                    b.mechanicId === criteria.mechanicId &&
                    b.bookingType === "scheduled" &&
                    matchesFilterTab(b, filter, now)
            );

            if (criteria.dateKey) {
                const { startOfDay, endOfDay } = getIndiaDayRange(
                    parseIndiaDateKeyToDate(criteria.dateKey)
                );
                list = list.filter(
                    (b) => b.scheduledDate >= startOfDay && b.scheduledDate < endOfDay
                );
            }

            if (criteria.serviceType) {
                const svc = criteria.serviceType.trim().toLowerCase();
                list = list.filter((b) => b.serviceType.toLowerCase().includes(svc));
            }

            if (criteria.search) {
                const rawSearch = criteria.search.trim();
                const idQuery = rawSearch.replace(/^(?:#|bk-)/i, "").toLowerCase();
                const customerSet = new Set(criteria.matchingCustomerIds ?? []);
                list = list.filter(
                    (b) =>
                        customerSet.has(b.userId) ||
                        (idQuery.length > 0 && b.id!.toLowerCase().includes(idQuery))
                );
            }

            list.sort((a, b) => {
                if (criteria.sort === "newest") {
                    return (
                        (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
                    );
                }
                return a.scheduledDate.getTime() - b.scheduledDate.getTime();
            });

            const total = list.length;
            const skip = (criteria.page - 1) * criteria.limit;
            return {
                bookings: list.slice(skip, skip + criteria.limit),
                total,
            };
        },
        async getMechanicBookingCounts(mechanicId, now = new Date()) {
            const owned = [...bookings.values()].filter(
                (b) => b.mechanicId === mechanicId && b.bookingType === "scheduled"
            );
            return {
                total: owned.filter((b) => VISIBLE_STATUSES.includes(b.status)).length,
                upcoming: owned.filter((b) => matchesFilterTab(b, "upcoming", now))
                    .length,
                today: owned.filter((b) => matchesFilterTab(b, "today", now)).length,
                inProgress: owned.filter((b) =>
                    matchesFilterTab(b, "in_progress", now)
                ).length,
                completed: owned.filter((b) => matchesFilterTab(b, "completed", now))
                    .length,
                cancelled: owned.filter((b) => matchesFilterTab(b, "cancelled", now))
                    .length,
            };
        },
        async findConflictingBooking(mechanicId, scheduledDate, slot, excludeBookingId) {
            const now = new Date();
            const targetDay = getIndiaDateParts(scheduledDate);
            for (const b of bookings.values()) {
                if (excludeBookingId && b.id === excludeBookingId) continue;
                if (b.mechanicId !== mechanicId) continue;
                if (!isBookingBlocking(b, now)) continue;
                const bDay = getIndiaDateParts(b.scheduledDate);
                if (
                    bDay.year === targetDay.year &&
                    bDay.month === targetDay.month &&
                    bDay.day === targetDay.day &&
                    isSlotConflict(b.slot, slot)
                ) {
                    return b;
                }
            }
            return null;
        },
        async findConflictingMechanicIds(mechanicIds, scheduledDate, slot) {
            const result = new Set<string>();
            for (const id of mechanicIds) {
                const c = await this.findConflictingBooking(id, scheduledDate, slot);
                if (c) result.add(id);
            }
            return result;
        },
        async findActiveScheduledBookingsByMechanic(mechanicId, startDate, endDate) {
            const now = new Date();
            return [...bookings.values()].filter(
                (b) =>
                    b.mechanicId === mechanicId &&
                    b.bookingType === "scheduled" &&
                    b.scheduledDate >= startDate &&
                    (!endDate || b.scheduledDate < endDate) &&
                    isBookingBlocking(b, now)
            );
        },
        async updateStatus(
            bookingId,
            status: BookingStatus,
            additionalFields?: Partial<BookingProps>,
            expected?: BookingStatus[]
        ) {
            const existing = bookings.get(bookingId);
            if (!existing) return null;
            if (expected && !expected.includes(existing.status)) return null;
            const updated = Booking.create({
                ...existing.toObject(),
                ...additionalFields,
                status,
                updatedAt: new Date(),
            });
            bookings.set(bookingId, updated);
            return updated;
        },
        async attachPaymentId(bookingId, paymentId) {
            const existing = bookings.get(bookingId);
            if (!existing) return null;
            const updated = Booking.create({ ...existing.toObject(), paymentId });
            bookings.set(bookingId, updated);
            return updated;
        },
        async expireStaleReservations(now = new Date()) {
            let count = 0;
            for (const [id, b] of bookings.entries()) {
                if (
                    b.status === "pending_payment" &&
                    b.reservationExpiresAt &&
                    b.reservationExpiresAt <= now
                ) {
                    bookings.set(
                        id,
                        Booking.create({
                            ...b.toObject(),
                            status: "expired",
                            expiredAt: now,
                        })
                    );
                    count++;
                }
            }
            return count;
        },
    };

    const paymentRepo: IPaymentRepository = {
        async create(payment) {
            const id = payment.id ?? nextHexId();
            const saved = Payment.create({ ...payment.toObject(), id });
            payments.set(id, saved);
            return saved;
        },
        async findById(id) {
            return payments.get(id) ?? null;
        },
        async findByBookingId(bookingId) {
            return [...payments.values()].find((p) => p.bookingId === bookingId) ?? null;
        },
        async findLatestByBookingId(bookingId) {
            const list = [...payments.values()].filter((p) => p.bookingId === bookingId);
            return list[list.length - 1] ?? null;
        },
        async findLatestByBookingIds(bookingIds) {
            const map = new Map<string, Payment>();
            for (const id of bookingIds) {
                const latest = await this.findLatestByBookingId(id);
                if (latest) map.set(id, latest);
            }
            return map;
        },
        async findByRazorpayOrderId(orderId) {
            return [...payments.values()].find((p) => p.razorpayOrderId === orderId) ?? null;
        },
        async findByRazorpayPaymentId(razorpayPaymentId) {
            return (
                [...payments.values()].find(
                    (p) => p.razorpayPaymentId === razorpayPaymentId
                ) ?? null
            );
        },
        async findByIdempotencyKey(idempotencyKey) {
            return (
                [...payments.values()].find(
                    (p) => p.idempotencyKey === idempotencyKey
                ) ?? null
            );
        },
        async updateStatus(
            paymentId,
            status: PaymentStatus,
            extra?: Partial<PaymentProps>,
            expected?: PaymentStatus[]
        ) {
            const existing = payments.get(paymentId);
            if (!existing) return null;
            if (expected && !expected.includes(existing.status)) return null;
            const updated = Payment.create({ ...existing.toObject(), ...extra, status });
            payments.set(paymentId, updated);
            return updated;
        },
        async createAllocation(allocation) {
            const existing = allocations.get(allocation.bookingId);
            if (existing) {
                throw new Error("E11000 duplicate allocation");
            }
            const id = allocation.id ?? nextHexId();
            const saved = PaymentAllocation.create({ ...allocation.toObject(), id });
            allocations.set(allocation.bookingId, saved);
            return saved;
        },
        async findAllocationByBookingId(bookingId) {
            return allocations.get(bookingId) ?? null;
        },
        async findAllocationByPaymentId(paymentId) {
            return (
                [...allocations.values()].find((a) => a.paymentId === paymentId) ??
                null
            );
        },
    };

    return {
        users,
        vehicles,
        applications,
        schedules,
        categories,
        bookings,
        payments,
        allocations,
        userRepo,
        vehicleRepo,
        appRepo,
        scheduleRepo,
        categoryRepo,
        fileStorage,
        bookingRepo,
        paymentRepo,
        nextHexId,
    };
}

function seedFixture(h: ReturnType<typeof createHarness>) {
    h.users.set(
        "cust_1",
        new User(
            "Ananya Nair",
            "ananya@example.com",
            "+91 9847011122",
            "hashed_pw_secret",
            ["user"],
            "cust_1",
            "google_secret_id",
            "LOCAL",
            "active",
            "user"
        )
    );
    h.users.set(
        "cust_2",
        new User(
            "Rahul Menon",
            "rahul@example.com",
            "+91 9847033344",
            "hashed_pw_secret2",
            ["user"],
            "cust_2",
            undefined,
            "LOCAL",
            "active",
            "user"
        )
    );
    h.users.set(
        "mech_1",
        new User(
            "Arjun Auto Works",
            "arjun.mech@example.com",
            "+91 9847099900",
            "hashed_pw_mech",
            ["user", "mechanic"],
            "mech_1",
            undefined,
            "LOCAL",
            "active",
            "mechanic"
        )
    );
    h.users.set(
        "mech_2",
        new User(
            "Kiran Motors",
            "kiran.mech@example.com",
            "+91 9847099901",
            "hashed_pw_mech2",
            ["user", "mechanic"],
            "mech_2",
            undefined,
            "LOCAL",
            "active",
            "mechanic"
        )
    );

    h.vehicles.set(
        "veh_1",
        new Vehicle(
            "cust_1",
            "KL-01-CD-4455",
            "car",
            "Hyundai",
            "i20",
            2022,
            "petrol",
            "Starry Night",
            "vehicles/i20-front.jpg",
            "ins_doc.pdf",
            "puc_doc.pdf",
            "veh_1"
        )
    );
    h.vehicles.set(
        "veh_2",
        new Vehicle(
            "cust_2",
            "KL-01-EF-8899",
            "bike",
            "Royal Enfield",
            "Classic 350",
            2023,
            "petrol",
            "Matte Black",
            undefined,
            undefined,
            undefined,
            "veh_2"
        )
    );

    h.categories.set(
        "cat_engine",
        new MechanicCategory({
            id: "cat_engine",
            name: "Engine & Drivetrain",
            slug: "engine-drivetrain",
            isActive: true,
            subcategories: [
                {
                    id: "sub_engine_repair",
                    name: "Engine Repair",
                    slug: "engine-repair",
                    isActive: true,
                },
            ],
        })
    );

    h.applications.set(
        "mech_1",
        new MechanicApplication({
            id: "app_mech_1",
            userId: "mech_1",
            status: "approved",
            serviceModel: "both",
            serviceAddress: "Sreekaryam, Thiruvananthapuram",
            latitude: 8.549,
            longitude: 76.915,
            serviceRadiusKm: 20,
            workshopName: "Arjun Precision Garage",
            supportedVehicleTypes: ["car", "bike"],
            serviceOffered: ["Engine Repair", "Brake Inspection"],
            specializations: [
                {
                    categoryId: "cat_engine",
                    subcategories: [
                        {
                            subcategoryId: "sub_engine_repair",
                            verificationStatus: "approved",
                        },
                    ],
                },
            ],
            documents: [],
        })
    );

    const tomorrowKey = getDateKeyOffset(1);
    const weekly = (
        ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
    ).map((day) => ({ day, morning: true, afternoon: true }));

    h.schedules.set(
        "mech_1",
        new MechanicSchedule(
            "mech_1",
            weekly,
            "09:00",
            "13:00",
            "14:00",
            "18:00",
            true,
            "sched_1",
            new Date(),
            new Date(),
            [
                {
                    date: tomorrowKey,
                    isAvailable: true,
                    morning: false,
                    afternoon: true,
                    afternoonStartTime: "14:30",
                    afternoonEndTime: "18:30",
                },
            ]
        )
    );
}

test("BookingMapper preserves problemDescription, startedAt, completedAt", () => {
    const startedAt = new Date("2026-11-28T09:15:00Z");
    const completedAt = new Date("2026-11-28T11:30:00Z");
    const booking = Booking.create({
        id: "67a1b2c3d4e5f60000000099",
        userId: "cust_1",
        vehicleId: "veh_1",
        mechanicId: "mech_1",
        bookingType: "scheduled",
        serviceType: "Engine Repair",
        problemDescription: "Cold start misfire and rough idling",
        serviceAddress: "Technopark Phase 1, Kazhakkoottam",
        latitude: 8.558,
        longitude: 76.881,
        scheduledDate: parseIndiaDateKeyToDate("2026-11-28"),
        slot: "afternoon",
        bookingAmount: 800,
        status: "completed",
        startedAt,
        completedAt,
    });

    const persistence = BookingMapper.toPersistence(booking);
    assert.equal(persistence.problemDescription, "Cold start misfire and rough idling");
    assert.deepEqual(persistence.startedAt, startedAt);
    assert.deepEqual(persistence.completedAt, completedAt);
    assert.equal(persistence.scheduledDateDayKey, "2026-11-28");
});

test("problemDescription flows from reservation through payment verification into mechanic booking details & allocation stays 60/40/700", async () => {
    const h = createHarness();
    seedFixture(h);
    const txManager = new FakeTransactionManager();
    const gateway = new MockPaymentGateway();
    const tomorrowKey = getDateKeyOffset(1);

    const reserveUC = new CreateBookingReservationUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo,
        txManager,
        h.categoryRepo
    );
    const orderUC = new CreatePaymentOrderUseCase(h.bookingRepo, h.paymentRepo, gateway);
    const settlement = new PaymentSettlementHelper(
        h.bookingRepo,
        h.paymentRepo,
        gateway,
        txManager
    );
    const verifyUC = new VerifyPaymentUseCase(
        h.bookingRepo,
        h.paymentRepo,
        gateway,
        settlement
    );
    const getMechBookingsUC = new GetMechanicBookingsUseCase(
        h.bookingRepo,
        h.vehicleRepo,
        h.userRepo,
        h.paymentRepo,
        h.scheduleRepo,
        h.categoryRepo,
        h.fileStorage
    );
    const detailsUC = new GetBookingDetailsUseCase(
        h.bookingRepo,
        h.paymentRepo,
        h.vehicleRepo,
        h.userRepo,
        h.appRepo,
        h.scheduleRepo,
        h.categoryRepo,
        h.fileStorage
    );

    // Validation check: oversized problemDescription rejected
    await assert.rejects(
        () =>
            reserveUC.execute("cust_1", {
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                problemDescription: "x".repeat(1001),
                serviceAddress: "Sreekaryam Junction",
                scheduledDate: tomorrowKey,
                slot: "afternoon",
                latitude: 8.55,
                longitude: 76.91,
            }),
        /1000 characters/i
    );

    const reservation = await reserveUC.execute("cust_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        problemDescription: "  Knocking sound from cylinder head when accelerating  ",
        serviceAddress: "Sreekaryam Junction",
        scheduledDate: tomorrowKey,
        slot: "afternoon",
        latitude: 8.55,
        longitude: 76.91,
    });

    assert.equal(reservation.status, "pending_payment");
    assert.equal(
        reservation.problemDescription,
        "Knocking sound from cylinder head when accelerating"
    );

    // Before payment verification: pending_payment must NOT show in mechanic bookings list
    const beforePayList = await getMechBookingsUC.execute("mech_1");
    assert.equal(beforePayList.bookings.length, 0);
    assert.equal(beforePayList.counts.total, 0);

    const order = await orderUC.execute("cust_1", {
        bookingId: reservation.bookingId,
    });

    // Unverified order must NOT expose customer payment details to mechanic
    const beforePayDetails = await detailsUC.execute(
        "mech_1",
        reservation.bookingId,
        "mechanic"
    );
    assert.equal(beforePayDetails.payment, undefined);

    // Verify Razorpay payment -> confirms booking automatically & keeps ₹60/₹40/₹700 split
    const verified = await verifyUC.execute("cust_1", {
        bookingId: reservation.bookingId,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: "pay_ok_1",
        razorpaySignature: "sig_valid_1",
    });

    assert.equal(verified.bookingStatus, "confirmed");
    assert.equal(verified.allocation.totalAmount, 800);
    assert.equal(verified.allocation.superAdminShare, 60);
    assert.equal(verified.allocation.adminShare, 40);
    assert.equal(verified.allocation.mechanicShare, 700);

    const afterPayList = await getMechBookingsUC.execute("mech_1", {
        filter: "upcoming",
    });
    assert.equal(afterPayList.bookings.length, 1);
    const item = afterPayList.bookings[0]!;
    assert.equal(item.status, "confirmed");
    assert.equal(
        item.problemDescription,
        "Knocking sound from cylinder head when accelerating"
    );
    assert.equal(item.customer?.fullName, "Ananya Nair");
    assert.equal(item.customer?.phoneNumber, "+91 9847011122");
    assert.equal(item.vehicle?.brand, "Hyundai");
    assert.equal(item.vehicle?.year, 2022);
    assert.equal(
        item.vehicle?.vehicleImage,
        "https://signed.s3.local/vehicles/i20-front.jpg"
    );
    assert.equal(item.serviceCategory?.categoryName, "Engine & Drivetrain");
    assert.equal(item.serviceCategory?.subcategoryName, "Engine Repair");
    assert.equal(item.scheduleTimings?.activeSlotStartTime, "14:30");
    assert.equal(item.scheduleTimings?.activeSlotEndTime, "18:30");
    assert.equal(item.paymentStatus, "paid");

    const afterPayDetails = await detailsUC.execute(
        "mech_1",
        reservation.bookingId,
        "mechanic"
    );
    assert.equal(afterPayDetails.payment?.status, "paid");
    assert.equal(afterPayDetails.payment?.amount, 800);
    assert.equal(afterPayDetails.allocation?.mechanicShare, 700);
    assert.equal(afterPayDetails.customer?.fullName, "Ananya Nair");
    assert.equal(
        (afterPayDetails.customer as unknown as Record<string, unknown>)?.password,
        undefined
    );
    assert.equal(afterPayDetails.payment?.failureReason, undefined);
});

test("Ownership enforcement, filtering, search, pagination, and atomic confirmed -> in_progress -> completed transitions", async () => {
    const h = createHarness();
    seedFixture(h);

    const todayDate = parseIndiaDateKeyToDate(getDateKeyOffset(0));
    const tomorrowDate = parseIndiaDateKeyToDate(getDateKeyOffset(1));
    const nextWeekDate = parseIndiaDateKeyToDate(getDateKeyOffset(5));

    const b1 = await h.bookingRepo.create(
        Booking.create({
            userId: "cust_1",
            vehicleId: "veh_1",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            problemDescription: "Timing chain check",
            serviceAddress: "Kazhakkoottam",
            latitude: 8.56,
            longitude: 76.88,
            scheduledDate: todayDate,
            slot: "morning",
            bookingAmount: 800,
            status: "confirmed",
            confirmedAt: new Date(),
            createdAt: new Date(Date.now() - 30000),
        })
    );

    const b2 = await h.bookingRepo.create(
        Booking.create({
            userId: "cust_2",
            vehicleId: "veh_2",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Brake Inspection",
            serviceAddress: "Pattom",
            scheduledDate: tomorrowDate,
            slot: "afternoon",
            bookingAmount: 800,
            status: "in_progress",
            confirmedAt: new Date(),
            startedAt: new Date(),
            createdAt: new Date(Date.now() - 20000),
        })
    );

    await h.bookingRepo.create(
        Booking.create({
            userId: "cust_1",
            vehicleId: "veh_1",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            serviceAddress: "Kowdiar",
            scheduledDate: nextWeekDate,
            slot: "full_day",
            bookingAmount: 800,
            status: "completed",
            confirmedAt: new Date(),
            startedAt: new Date(),
            completedAt: new Date(),
            createdAt: new Date(Date.now() - 10000),
        })
    );

    await h.bookingRepo.create(
        Booking.create({
            userId: "cust_2",
            vehicleId: "veh_2",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Brake Inspection",
            serviceAddress: "Vellayambalam",
            scheduledDate: tomorrowDate,
            slot: "morning",
            bookingAmount: 800,
            status: "cancelled",
            cancelledAt: new Date(),
        })
    );

    // Unrelated / hidden records that must NOT show in mech_1 dashboard
    await h.bookingRepo.create(
        Booking.create({
            userId: "cust_1",
            vehicleId: "veh_1",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            serviceAddress: "Unpaid",
            scheduledDate: tomorrowDate,
            slot: "morning",
            bookingAmount: 800,
            status: "pending_payment",
        })
    );
    await h.bookingRepo.create(
        Booking.create({
            userId: "cust_1",
            vehicleId: "veh_1",
            mechanicId: "mech_2",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            serviceAddress: "Other Mechanic",
            scheduledDate: todayDate,
            slot: "morning",
            bookingAmount: 800,
            status: "confirmed",
        })
    );

    const listUC = new GetMechanicBookingsUseCase(
        h.bookingRepo,
        h.vehicleRepo,
        h.userRepo,
        h.paymentRepo,
        h.scheduleRepo,
        h.categoryRepo
    );
    const detailsUC = new GetBookingDetailsUseCase(
        h.bookingRepo,
        h.paymentRepo,
        h.vehicleRepo,
        h.userRepo,
        h.appRepo,
        h.scheduleRepo,
        h.categoryRepo
    );
    const startUC = new StartMechanicBookingUseCase(h.bookingRepo);
    const completeUC = new CompleteMechanicBookingUseCase(h.bookingRepo);

    // Counts & pagination
    const page1 = await listUC.execute("mech_1", { page: 1, limit: 2 });
    assert.equal(page1.counts.total, 4);
    assert.equal(page1.counts.upcoming, 1);
    assert.equal(page1.counts.today, 1);
    assert.equal(page1.counts.inProgress, 1);
    assert.equal(page1.counts.completed, 1);
    assert.equal(page1.counts.cancelled, 1);
    assert.equal(page1.bookings.length, 2);
    assert.equal(page1.pagination.totalPages, 2);
    assert.equal(page1.pagination.hasNextPage, true);

    // Search by customer name & date filter
    const searchRahul = await listUC.execute("mech_1", { search: "Rahul" });
    assert.equal(searchRahul.bookings.length, 2);

    const searchByRef = await listUC.execute("mech_1", {
        search: `BK-${b1.id!.slice(-6).toUpperCase()}`,
    });
    assert.equal(searchByRef.bookings.length, 1);
    assert.equal(searchByRef.bookings[0]!.bookingId, b1.id);

    const filterToday = await listUC.execute("mech_1", { filter: "today" });
    assert.equal(filterToday.bookings.length, 1);
    assert.equal(filterToday.bookings[0]!.bookingId, b1.id);

    // Ownership isolation: mech_2 cannot view, start, or complete mech_1's booking
    await assert.rejects(
        () => detailsUC.execute("mech_2", b1.id!, "mechanic"),
        /not authorized/i
    );
    await assert.rejects(() => startUC.execute("mech_2", b1.id!), /not authorized/i);
    await assert.rejects(
        () => completeUC.execute("mech_2", b2.id!),
        /not authorized/i
    );
    // Customer cust_1 switching role to mechanic cannot view mech_1's booking on mechanic endpoint
    await assert.rejects(
        () => detailsUC.execute("cust_1", b1.id!, "mechanic"),
        /not authorized/i
    );

    // Cannot complete before starting (b1 is confirmed)
    await assert.rejects(
        () => completeUC.execute("mech_1", b1.id!),
        /cannot complete service before starting/i
    );

    // Start confirmed booking -> in_progress
    const started = await startUC.execute("mech_1", b1.id!);
    assert.equal(started.status, "in_progress");
    assert.ok(started.startedAt instanceof Date);

    // Cannot start already in_progress booking
    await assert.rejects(
        () => startUC.execute("mech_1", b1.id!),
        /already been started/i
    );

    // Complete in_progress booking -> completed
    const completed = await completeUC.execute("mech_1", b1.id!);
    assert.equal(completed.status, "completed");
    assert.ok(completed.completedAt instanceof Date);

    // Cannot complete already completed booking or start completed booking
    await assert.rejects(
        () => completeUC.execute("mech_1", b1.id!),
        /already been completed/i
    );
    await assert.rejects(
        () => startUC.execute("mech_1", b1.id!),
        /cannot start service/i
    );
});
