import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";

import { User } from "../src/domain/User/entities/User.js";
import { Vehicle } from "../src/domain/vehilce/Vehilce.js";
import { MechanicApplication } from "../src/domain/User/entities/MechanicApplication.js";
import { MechanicSchedule } from "../src/domain/User/entities/MechanicSchedule.js";
import { Booking, BookingProps } from "../src/domain/User/entities/Booking.js";
import { Payment, PaymentProps } from "../src/domain/User/entities/Payment.js";
import { PaymentAllocation } from "../src/domain/User/entities/PaymentAllocation.js";
import { BookingSlot, BookingStatus, PaymentStatus } from "../src/domain/User/Types/BookingTypes.js";

import { IUserRepository } from "../src/domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../src/domain/repositories/IVehicleRepository.js";
import { IMechanicApplicationRepository } from "../src/domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../src/domain/repositories/IMechanicScheduleRepository.js";
import { IBookingRepository } from "../src/domain/repositories/IBookingRepository.js";
import { IPaymentRepository } from "../src/domain/repositories/IPaymentRepository.js";
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

import { DiscoverAvailableMechanicsUseCase } from "../src/application/useCase/booking/DiscoverAvailableMechanicsUseCase.js";
import { CreateBookingReservationUseCase } from "../src/application/useCase/booking/CreateBookingReservationUseCase.js";
import { CreatePaymentOrderUseCase } from "../src/application/useCase/booking/CreatePaymentOrderUseCase.js";
import { PaymentSettlementHelper } from "../src/application/useCase/booking/PaymentSettlementHelper.js";
import { VerifyPaymentUseCase } from "../src/application/useCase/booking/VerifyPaymentUseCase.js";
import { HandlePaymentWebhookUseCase } from "../src/application/useCase/booking/HandlePaymentWebhookUseCase.js";
import { GetBookingStatusUseCase } from "../src/application/useCase/booking/GetBookingStatusUseCase.js";
import { GetBookingDetailsUseCase } from "../src/application/useCase/booking/GetBookingDetailsUseCase.js";
import { GetMyBookingsUseCase } from "../src/application/useCase/booking/GetMyBookingsUseCase.js";
import { BookingMapper } from "../src/application/mappers/BookingMapper.js";
import { RazorpayWebhookController } from "../src/presentation/controllers/Booking/RazorpayWebhookController.js";
import { RazorpayService } from "../src/infrastructure/services/razorpay/RazorpayService.js";
import {
    getIndiaDateParts,
    getIndiaDayKey,
    isShiftWindowPassedForDate,
} from "../src/shared/utils/timezone.js";

class FakeTransactionManager implements ITransactionManager {
    async execute<T>(operation: (tx: ITransactionContext) => Promise<T>): Promise<T> {
        return operation({});
    }
}

function getFutureDateIso(daysAhead = 2): string {
    const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return d.toISOString();
}

function createInMemoryRepos() {
    const users = new Map<string, User>();
    const vehicles = new Map<string, Vehicle>();
    const applications = new Map<string, MechanicApplication>();
    const schedules = new Map<string, MechanicSchedule>();
    const bookings = new Map<string, Booking>();
    const payments = new Map<string, Payment>();
    const allocations = new Map<string, PaymentAllocation>();
    let idSeq = 1;
    const nextId = (prefix: string) => `${prefix}_${idSeq++}`;

    const userRepo: IUserRepository = {
        async save(u) { return u; },
        async findbyemail() { return null; },
        async findAll() { return [...users.values()]; },
        async createGoogleUser() { throw new Error("not implemented"); },
        async findById(id) { return users.get(id) ?? null; },
        async updateStatus() { return null; },
        async updatePassword() { return null; },
        async addRole() { return null; },
        async updateActiveRole() { return null; },
        async findByIds(ids) {
            return ids.map((id) => users.get(id)).filter((u): u is User => Boolean(u));
        },
    };

    const vehicleRepo: IVehicleRepository = {
        async create(v) { return v; },
        async findByUserId(userId) {
            return [...vehicles.values()].filter((v) => v.userId === userId);
        },
        async findById(id) { return vehicles.get(id) ?? null; },
        async update() { return null; },
        async delete() { return false; },
    };

    const appRepo: IMechanicApplicationRepository = {
        async create(a) { return a; },
        async findById(id) {
            return [...applications.values()].find((a) => a.id === id) ?? null;
        },
        async findByUserId(userId) { return applications.get(userId) ?? null; },
        async update() { return null; },
        async findByStatus(status) {
            return [...applications.values()].filter((a) => a.status === status);
        },
        async findByUserIds(userIds) {
            return userIds
                .map((id) => applications.get(id))
                .filter((a): a is MechanicApplication => Boolean(a));
        },
        async updateServiceLocation() { return null; },
    };

    const scheduleRepo: IMechanicScheduleRepository = {
        async create(s) { return s; },
        async findByMechanicId(id) { return schedules.get(id) ?? null; },
        async update() { return null; },
        async findActiveByMechanicIds(ids) {
            return ids
                .map((id) => schedules.get(id))
                .filter((s): s is MechanicSchedule => Boolean(s && s.isActive));
        },
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

    const bookingRepo: IBookingRepository = {
        async create(booking) {
            const id = booking.id ?? nextId("bk");
            // Enforce the same multikey unique constraint as MongoDB's unique_active_mechanic_shift_per_day
            const persistence = BookingMapper.toPersistence(booking);
            for (const existing of bookings.values()) {
                if (
                    existing.mechanicId === booking.mechanicId &&
                    ["pending_payment", "pending", "accepted", "confirmed", "in_progress"].includes(existing.status) &&
                    getIndiaDayKey(existing.scheduledDate) === persistence.scheduledDateDayKey
                ) {
                    const existingShifts =
                        existing.slot === "full_day" ? ["morning", "afternoon"] : [existing.slot];
                    if (persistence.occupiedShifts.some((s) => existingShifts.includes(s))) {
                        throw new Error("E11000 duplicate key error: unique_active_mechanic_shift_per_day");
                    }
                }
            }
            const saved = Booking.create({ ...booking.toObject(), id, createdAt: new Date(), updatedAt: new Date() });
            bookings.set(id, saved);
            return saved;
        },
        async findById(id) { return bookings.get(id) ?? null; },
        async findByIdAndUserId(id, userId) {
            const b = bookings.get(id);
            return b && b.userId === userId ? b : null;
        },
        async findByUserId(userId, page = 1, limit = 10, statuses?: BookingStatus[]) {
            const list = [...bookings.values()].filter(
                (b) =>
                    b.userId === userId &&
                    (!statuses || statuses.length === 0 || statuses.includes(b.status))
            );
            const skip = (page - 1) * limit;
            return list.slice(skip, skip + limit);
        },
        async countByUserId(userId, statuses?: BookingStatus[]) {
            return [...bookings.values()].filter(
                (b) =>
                    b.userId === userId &&
                    (!statuses || statuses.length === 0 || statuses.includes(b.status))
            ).length;
        },
        async findByMechanicId(mechanicId) {
            return [...bookings.values()].filter((b) => b.mechanicId === mechanicId);
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
        async updateStatus(bookingId, status: BookingStatus, additionalFields?: Partial<BookingProps>, expected?: BookingStatus[]) {
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
                        Booking.create({ ...b.toObject(), status: "expired", expiredAt: now })
                    );
                    count++;
                }
            }
            return count;
        },
    };

    const paymentRepo: IPaymentRepository = {
        async create(payment) {
            const id = payment.id ?? nextId("pay");
            const saved = Payment.create({ ...payment.toObject(), id, createdAt: new Date(), updatedAt: new Date() });
            payments.set(id, saved);
            return saved;
        },
        async findById(id) { return payments.get(id) ?? null; },
        async findByBookingId(bookingId) {
            return [...payments.values()].find((p) => p.bookingId === bookingId) ?? null;
        },
        async findLatestByBookingId(bookingId) {
            const list = [...payments.values()].filter((p) => p.bookingId === bookingId);
            return list.length > 0 ? list[list.length - 1]! : null;
        },
        async findLatestByBookingIds(bookingIds) {
            const map = new Map<string, Payment>();
            for (const bid of bookingIds) {
                const list = [...payments.values()].filter((p) => p.bookingId === bid);
                if (list.length > 0) {
                    map.set(bid, list[list.length - 1]!);
                }
            }
            return map;
        },
        async findByRazorpayOrderId(orderId) {
            return [...payments.values()].find((p) => p.razorpayOrderId === orderId) ?? null;
        },
        async findByRazorpayPaymentId(rzpPayId) {
            return [...payments.values()].find((p) => p.razorpayPaymentId === rzpPayId) ?? null;
        },
        async findByIdempotencyKey(key) {
            return [...payments.values()].find((p) => p.idempotencyKey === key) ?? null;
        },
        async updateStatus(paymentId, status: PaymentStatus, fields?: Partial<PaymentProps>, expected?: PaymentStatus[]) {
            const existing = payments.get(paymentId);
            if (!existing) return null;
            if (expected && !expected.includes(existing.status)) return null;
            const updated = Payment.create({
                ...existing.toObject(),
                ...fields,
                status,
                updatedAt: new Date(),
            });
            payments.set(paymentId, updated);
            return updated;
        },
        async createAllocation(allocation) {
            const id = allocation.id ?? nextId("alloc");
            const saved = PaymentAllocation.create({
                ...allocation.toObject(),
                id,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            allocations.set(allocation.bookingId, saved);
            return saved;
        },
        async findAllocationByBookingId(bookingId) {
            return allocations.get(bookingId) ?? null;
        },
        async findAllocationByPaymentId(paymentId) {
            return [...allocations.values()].find((a) => a.paymentId === paymentId) ?? null;
        },
    };

    return {
        users,
        vehicles,
        applications,
        schedules,
        bookings,
        payments,
        allocations,
        userRepo,
        vehicleRepo,
        appRepo,
        scheduleRepo,
        bookingRepo,
        paymentRepo,
    };
}

class MockPaymentGateway implements IPaymentGateway {
    public orderCounter = 1;
    public refundCalls: RefundPaymentInput[] = [];
    public shouldFailRefund = false;
    public fetchedPaymentOverride: Partial<FetchPaymentResult> = {};
    public signatureValid = true;
    public webhookSignatureValid = true;
    public refundStatus: string = "pending";

    getKeyId(): string {
        return "rzp_test_key";
    }

    async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
        const orderId = `order_test_${this.orderCounter++}`;
        return {
            orderId,
            amount: input.amountPaise,
            currency: input.currency,
            receipt: input.receipt,
            status: "created",
        };
    }

    verifyPaymentSignature(_input: VerifySignatureInput): boolean {
        return this.signatureValid;
    }

    verifyWebhookSignature(_rawBody: Buffer | string, _signature: string): boolean {
        return this.webhookSignatureValid;
    }

    async fetchPayment(paymentId: string): Promise<FetchPaymentResult> {
        return {
            paymentId,
            orderId: this.fetchedPaymentOverride.orderId ?? "order_test_1",
            status: this.fetchedPaymentOverride.status ?? "captured",
            amount: this.fetchedPaymentOverride.amount ?? 80000,
            currency: this.fetchedPaymentOverride.currency ?? "INR",
            captured: this.fetchedPaymentOverride.captured ?? true,
        };
    }

    async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult> {
        this.refundCalls.push(input);
        if (this.shouldFailRefund) {
            throw new Error("Gateway refund timeout");
        }
        return {
            refundId: "rfnd_test_1",
            paymentId: input.paymentId,
            amount: input.amountPaise ?? 80000,
            status: this.refundStatus,
        };
    }
}

function seedEligibleSetup(repos: ReturnType<typeof createInMemoryRepos>, scheduledIso: string) {
    const dayOfWeek = getIndiaDateParts(new Date(scheduledIso)).dayOfWeek;

    repos.users.set(
        "user_1",
        new User("Customer One", "cust@test.com", "9999999999", undefined, ["user"], "user_1", undefined, "LOCAL", "active", "user")
    );
    repos.users.set(
        "mech_1",
        new User("Mechanic Near", "m1@test.com", "8888888888", undefined, ["mechanic"], "mech_1", undefined, "LOCAL", "active", "mechanic")
    );
    repos.users.set(
        "mech_far",
        new User("Mechanic Far", "m2@test.com", "7777777777", undefined, ["mechanic"], "mech_far", undefined, "LOCAL", "active", "mechanic")
    );

    repos.vehicles.set(
        "veh_1",
        new Vehicle("user_1", "KL01AB1234", "car", "Honda", "City", 2022, "petrol", "White", undefined, undefined, undefined, "veh_1")
    );

    repos.applications.set(
        "mech_1",
        new MechanicApplication({
            id: "app_1",
            userId: "mech_1",
            status: "approved",
            supportedVehicleTypes: ["car", "bike"],
            serviceOffered: ["Engine Repair", "Battery Jumpstart"],
            serviceModel: "both",
            serviceAddress: "MG Road, Kochi",
            latitude: 9.9312,
            longitude: 76.2673,
            serviceRadiusKm: 15,
        })
    );

    repos.applications.set(
        "mech_far",
        new MechanicApplication({
            id: "app_2",
            userId: "mech_far",
            status: "approved",
            supportedVehicleTypes: ["car"],
            serviceOffered: ["Engine Repair"],
            serviceModel: "mobile",
            latitude: 10.5276,
            longitude: 76.2144,
            serviceRadiusKm: 10,
        })
    );

    const scheduleFor = (mechanicId: string) =>
        new MechanicSchedule(
            mechanicId,
            [{ day: dayOfWeek, morning: true, afternoon: true }],
            "09:00",
            "13:00",
            "14:00",
            "18:00",
            true,
            `sch_${mechanicId}`
        );

    repos.schedules.set("mech_1", scheduleFor("mech_1"));
    repos.schedules.set("mech_far", scheduleFor("mech_far"));
}

test("DiscoverAvailableMechanicsUseCase applies all eligibility filters and sorts by distance", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);

    const useCase = new DiscoverAvailableMechanicsUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo
    );

    const result = await useCase.execute("user_1", {
        scheduledDate,
        slot: "morning",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.935,
        longitude: 76.27,
    });

    assert.equal(result.bookingAmount, 800);
    assert.equal(result.currency, "INR");
    assert.equal(result.mechanics.length, 1);
    assert.equal(result.mechanics[0]?.mechanicId, "mech_1");
});

test("Full scheduled booking flow: reserve -> create order (idempotent) -> verify -> allocate -> duplicate verify", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);

    const gateway = new MockPaymentGateway();
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );
    const orderUC = new CreatePaymentOrderUseCase(repos.bookingRepo, repos.paymentRepo, gateway);
    const settlementHelper = new PaymentSettlementHelper(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        txManager
    );
    const verifyUC = new VerifyPaymentUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );

    const reservation = await reserveUC.execute("user_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road, Kochi",
        scheduledDate,
        slot: "morning",
        latitude: 9.935,
        longitude: 76.27,
    });

    assert.equal(reservation.status, "pending_payment");
    assert.equal(reservation.bookingAmount, 800);

    // Concurrent reservation for overlapping full_day slot must fail
    await assert.rejects(
        () =>
            reserveUC.execute("user_1", {
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                serviceAddress: "MG Road, Kochi",
                scheduledDate,
                slot: "full_day",
                latitude: 9.935,
                longitude: 76.27,
            }),
        /already booked or reserved/i
    );

    // Create order twice -> idempotent
    const order1 = await orderUC.execute("user_1", { bookingId: reservation.bookingId });
    const order2 = await orderUC.execute("user_1", { bookingId: reservation.bookingId });
    assert.equal(order1.razorpayOrderId, order2.razorpayOrderId);
    assert.equal(order1.amountPaise, 80000);

    gateway.fetchedPaymentOverride = { orderId: order1.razorpayOrderId };

    const verified = await verifyUC.execute("user_1", {
        bookingId: reservation.bookingId,
        razorpayOrderId: order1.razorpayOrderId,
        razorpayPaymentId: "pay_test_1",
        razorpaySignature: "sig_valid",
    });

    assert.equal(verified.bookingStatus, "confirmed");
    assert.equal(verified.paymentStatus, "paid");
    assert.equal(verified.allocation.totalAmount, 800);
    assert.equal(verified.allocation.superAdminShare, 60);
    assert.equal(verified.allocation.adminShare, 40);
    assert.equal(verified.allocation.mechanicShare, 700);

    // Duplicate verify call -> idempotent
    const verifiedAgain = await verifyUC.execute("user_1", {
        bookingId: reservation.bookingId,
        razorpayOrderId: order1.razorpayOrderId,
        razorpayPaymentId: "pay_test_1",
        razorpaySignature: "sig_valid",
    });
    assert.equal(verifiedAgain.allocation.id, verified.allocation.id);
});

test("VerifyPaymentUseCase rejects invalid signature WITHOUT corrupting legitimate payment state", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);
    const gateway = new MockPaymentGateway();
    gateway.signatureValid = false;
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );
    const orderUC = new CreatePaymentOrderUseCase(repos.bookingRepo, repos.paymentRepo, gateway);
    const settlementHelper = new PaymentSettlementHelper(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        txManager
    );
    const verifyUC = new VerifyPaymentUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );

    const reservation = await reserveUC.execute("user_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road",
        scheduledDate,
        slot: "afternoon",
        latitude: 9.935,
        longitude: 76.27,
    });
    const order = await orderUC.execute("user_1", { bookingId: reservation.bookingId });

    await assert.rejects(
        () =>
            verifyUC.execute("user_1", {
                bookingId: reservation.bookingId,
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: "pay_forged",
                razorpaySignature: "bad_sig",
            }),
        /Invalid payment signature/i
    );

    // Legitimate payment record must remain untouched in "created" status
    const savedPayment = await repos.paymentRepo.findById(order.paymentId);
    assert.equal(savedPayment?.status, "created");
    assert.equal(savedPayment?.razorpayPaymentId, undefined);

    // Subsequent valid verification succeeds
    gateway.signatureValid = true;
    gateway.fetchedPaymentOverride = { orderId: order.razorpayOrderId };
    const confirmed = await verifyUC.execute("user_1", {
        bookingId: reservation.bookingId,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: "pay_real_1",
        razorpaySignature: "valid_sig",
    });
    assert.equal(confirmed.bookingStatus, "confirmed");
});

test("Expired reservation marks refund_requested when gateway refund is pending, then refunded on refund.processed webhook", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);
    const gateway = new MockPaymentGateway();
    gateway.refundStatus = "pending";
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );
    const orderUC = new CreatePaymentOrderUseCase(repos.bookingRepo, repos.paymentRepo, gateway);
    const settlementHelper = new PaymentSettlementHelper(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        txManager
    );
    const verifyUC = new VerifyPaymentUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );
    const webhookUC = new HandlePaymentWebhookUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );

    const reservation = await reserveUC.execute("user_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road",
        scheduledDate,
        slot: "morning",
        latitude: 9.935,
        longitude: 76.27,
    });
    const order = await orderUC.execute("user_1", { bookingId: reservation.bookingId });

    // Force reservation expiry
    const bk = repos.bookings.get(reservation.bookingId)!;
    repos.bookings.set(
        reservation.bookingId,
        Booking.create({
            ...bk.toObject(),
            reservationExpiresAt: new Date(Date.now() - 60_000),
        })
    );

    gateway.fetchedPaymentOverride = { orderId: order.razorpayOrderId };

    await assert.rejects(
        () =>
            verifyUC.execute("user_1", {
                bookingId: reservation.bookingId,
                razorpayOrderId: order.razorpayOrderId,
                razorpayPaymentId: "pay_late_1",
                razorpaySignature: "sig_valid",
            }),
        /expired/i
    );

    assert.equal(gateway.refundCalls.length, 1);
    const requestedPayment = await repos.paymentRepo.findById(order.paymentId);
    assert.equal(requestedPayment?.status, "refund_requested");

    // Razorpay refund.processed webhook completes the refund
    await webhookUC.execute("{}", "sig", {
        event: "refund.processed",
        payload: {
            refund: {
                entity: {
                    id: "rfnd_test_1",
                    payment_id: "pay_late_1",
                    status: "processed",
                },
            },
        },
    });
    const refundedPayment = await repos.paymentRepo.findById(order.paymentId);
    assert.equal(refundedPayment?.status, "refunded");
});

test("HandlePaymentWebhookUseCase processes payment.captured and payment.failed idempotently", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);
    const gateway = new MockPaymentGateway();
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );
    const orderUC = new CreatePaymentOrderUseCase(repos.bookingRepo, repos.paymentRepo, gateway);
    const settlementHelper = new PaymentSettlementHelper(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        txManager
    );
    const webhookUC = new HandlePaymentWebhookUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );
    const statusUC = new GetBookingStatusUseCase(repos.bookingRepo, repos.paymentRepo);

    const reservation = await reserveUC.execute("user_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road",
        scheduledDate,
        slot: "morning",
        latitude: 9.935,
        longitude: 76.27,
    });
    const order = await orderUC.execute("user_1", { bookingId: reservation.bookingId });

    const res1 = await webhookUC.execute(
        "{}",
        "sig",
        {
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: "pay_wh_1",
                        order_id: order.razorpayOrderId,
                        amount: 80000,
                        currency: "INR",
                    },
                },
            },
        }
    );
    assert.equal(res1.processed, true);

    const status = await statusUC.execute("user_1", reservation.bookingId);
    assert.equal(status.status, "confirmed");
    assert.equal(status.payment?.status, "paid");

    // Second webhook delivery is idempotent
    const res2 = await webhookUC.execute("{}", "sig", {
        event: "payment.captured",
        payload: {
            payment: {
                entity: {
                    id: "pay_wh_1",
                    order_id: order.razorpayOrderId,
                    amount: 80000,
                },
            },
        },
    });
    assert.match(res2.message, /idempotently/i);
});

test("RazorpayService verifies HMAC-SHA256 payment and webhook signatures accurately", () => {
    const service = new RazorpayService({
        keyId: "rzp_test_123",
        keySecret: "secret_abc",
        webhookSecret: "whsec_xyz",
    });

    const validPaymentSig = crypto
        .createHmac("sha256", "secret_abc")
        .update("order_1|pay_1")
        .digest("hex");

    assert.equal(
        service.verifyPaymentSignature({
            orderId: "order_1",
            paymentId: "pay_1",
            signature: validPaymentSig,
        }),
        true
    );
    assert.equal(
        service.verifyPaymentSignature({
            orderId: "order_1",
            paymentId: "pay_1",
            signature: "invalid_sig",
        }),
        false
    );

    const rawBody = Buffer.from('{"event":"payment.captured"}', "utf8");
    const validWebhookSig = crypto
        .createHmac("sha256", "whsec_xyz")
        .update(rawBody)
        .digest("hex");

    assert.equal(service.verifyWebhookSignature(rawBody, validWebhookSig), true);
    assert.equal(service.verifyWebhookSignature(rawBody, "bad"), false);
});


test("Overlapping shift concurrency: simultaneous morning vs full_day and afternoon vs full_day allow at most one reservation", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );

    const [r1, r2] = await Promise.allSettled([
        reserveUC.execute("user_1", {
            mechanicId: "mech_1",
            vehicleId: "veh_1",
            serviceType: "Engine Repair",
            serviceAddress: "MG Road",
            scheduledDate,
            slot: "morning",
            latitude: 9.935,
            longitude: 76.27,
        }),
        reserveUC.execute("user_1", {
            mechanicId: "mech_1",
            vehicleId: "veh_1",
            serviceType: "Engine Repair",
            serviceAddress: "MG Road",
            scheduledDate,
            slot: "full_day",
            latitude: 9.935,
            longitude: 76.27,
        }),
    ]);

    const succeeded = [r1, r2].filter((r) => r.status === "fulfilled");
    const failed = [r1, r2].filter((r) => r.status === "rejected");
    assert.equal(succeeded.length, 1);
    assert.equal(failed.length, 1);

    // Also verify BookingMapper emits occupiedShifts for full_day vs morning/afternoon
    const fullDayPersistence = BookingMapper.toPersistence(
        Booking.create({
            userId: "u1",
            vehicleId: "v1",
            mechanicId: "m1",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            serviceAddress: "Addr",
            scheduledDate: new Date(scheduledDate),
            slot: "full_day",
            bookingAmount: 800,
            status: "pending_payment",
        })
    );
    assert.deepEqual(fullDayPersistence.occupiedShifts, ["morning", "afternoon"]);
});

test("Simultaneous verify + webhook processing and payment recovery from failed status", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);
    const gateway = new MockPaymentGateway();
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );
    const orderUC = new CreatePaymentOrderUseCase(repos.bookingRepo, repos.paymentRepo, gateway);
    const settlementHelper = new PaymentSettlementHelper(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        txManager
    );
    const verifyUC = new VerifyPaymentUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );
    const webhookUC = new HandlePaymentWebhookUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );

    const reservation = await reserveUC.execute("user_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road",
        scheduledDate,
        slot: "morning",
        latitude: 9.935,
        longitude: 76.27,
    });
    const order = await orderUC.execute("user_1", { bookingId: reservation.bookingId });
    gateway.fetchedPaymentOverride = { orderId: order.razorpayOrderId };

    // Simulate out-of-order payment.failed before payment.captured
    await webhookUC.execute("{}", "sig", {
        event: "payment.failed",
        payload: {
            payment: {
                entity: {
                    id: "pay_retry_1",
                    order_id: order.razorpayOrderId,
                    error_description: "Initial attempt failed",
                },
            },
        },
    });
    assert.equal((await repos.paymentRepo.findById(order.paymentId))?.status, "failed");

    // Simultaneous verify + webhook recovery
    const [verifyRes, webhookRes] = await Promise.all([
        verifyUC.execute("user_1", {
            bookingId: reservation.bookingId,
            razorpayOrderId: order.razorpayOrderId,
            razorpayPaymentId: "pay_retry_1",
            razorpaySignature: "valid_sig",
        }),
        webhookUC.execute("{}", "sig", {
            event: "payment.captured",
            payload: {
                payment: {
                    entity: {
                        id: "pay_retry_1",
                        order_id: order.razorpayOrderId,
                        amount: 80000,
                    },
                },
            },
        }),
    ]);

    assert.equal(verifyRes.bookingStatus, "confirmed");
    assert.equal(webhookRes.processed, true);
    assert.equal(repos.allocations.size, 1);
});

test("Authorization scoping and strict webhook rawBody requirement", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);
    const gateway = new MockPaymentGateway();
    const txManager = new FakeTransactionManager();

    const reserveUC = new CreateBookingReservationUseCase(
        repos.userRepo,
        repos.vehicleRepo,
        repos.appRepo,
        repos.scheduleRepo,
        repos.bookingRepo,
        txManager
    );
    const orderUC = new CreatePaymentOrderUseCase(repos.bookingRepo, repos.paymentRepo, gateway);
    const detailsUC = new GetBookingDetailsUseCase(repos.bookingRepo, repos.paymentRepo);
    const settlementHelper = new PaymentSettlementHelper(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        txManager
    );
    const webhookUC = new HandlePaymentWebhookUseCase(
        repos.bookingRepo,
        repos.paymentRepo,
        gateway,
        settlementHelper
    );

    const reservation = await reserveUC.execute("user_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "MG Road",
        scheduledDate,
        slot: "morning",
        latitude: 9.935,
        longitude: 76.27,
    });
    await orderUC.execute("user_1", { bookingId: reservation.bookingId });

    // Unrelated user cannot view booking
    await assert.rejects(
        () => detailsUC.execute("other_user", reservation.bookingId),
        /not authorized/i
    );

    // Mechanic can view booking details, but customer payment details are omitted
    const mechanicView = await detailsUC.execute("mech_1", reservation.bookingId);
    assert.equal(mechanicView.bookingId, reservation.bookingId);
    assert.equal(mechanicView.payment, undefined);

    // Customer sees their own payment details
    const customerView = await detailsUC.execute("user_1", reservation.bookingId);
    assert.ok(customerView.payment?.razorpayOrderId);

    // Webhook controller rejects missing rawBody
    const controller = new RazorpayWebhookController(webhookUC);
    await assert.rejects(
        () =>
            controller.handle(
                { headers: { "x-razorpay-signature": "sig" }, body: {} } as never,
                {} as never
            ),
        /Raw webhook payload is required/i
    );
});

test("Timezone Asia/Kolkata date boundary and same-day shift start validation for all three shifts", () => {
    // 2026-11-28T18:29:00Z = 2026-11-28 23:59 IST
    const beforeIstMidnight = new Date("2026-11-28T18:29:00.000Z");
    // 2026-11-28T18:30:00Z = 2026-11-29 00:00 IST
    const atIstMidnight = new Date("2026-11-28T18:30:00.000Z");

    assert.equal(getIndiaDayKey(beforeIstMidnight), "2026-11-28");
    assert.equal(getIndiaDayKey(atIstMidnight), "2026-11-29");

    const scheduleTimes = {
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
    };

    // 08:59 IST on 2026-11-29 (03:29 UTC): all three shifts available
    const at0859Ist = new Date("2026-11-29T03:29:00.000Z");
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "morning", scheduleTimes, at0859Ist), false);
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "afternoon", scheduleTimes, at0859Ist), false);
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "full_day", scheduleTimes, at0859Ist), false);

    // 09:00 IST on 2026-11-29 (03:30 UTC): morning & full_day blocked; afternoon still available
    const at0900Ist = new Date("2026-11-29T03:30:00.000Z");
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "morning", scheduleTimes, at0900Ist), true);
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "full_day", scheduleTimes, at0900Ist), true);
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "afternoon", scheduleTimes, at0900Ist), false);

    // 14:00 IST on 2026-11-29 (08:30 UTC): afternoon also blocked
    const at1400Ist = new Date("2026-11-29T08:30:00.000Z");
    assert.equal(isShiftWindowPassedForDate(atIstMidnight, "afternoon", scheduleTimes, at1400Ist), true);
});

test("GetMyBookingsUseCase returns paginated customer bookings with vehicle, mechanic, and payment summaries", async () => {
    const repos = createInMemoryRepos();
    const scheduledDate = getFutureDateIso(2);
    seedEligibleSetup(repos, scheduledDate);

    // Seed second user's booking to verify isolation
    repos.users.set(
        "user_2",
        new User("Other User", "other@test.com", "6666666666", undefined, ["user"], "user_2", undefined, "LOCAL", "active", "user")
    );

    const bk1 = await repos.bookingRepo.create(
        Booking.create({
            userId: "user_1",
            vehicleId: "veh_1",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            serviceAddress: "MG Road, Kochi",
            scheduledDate: new Date(scheduledDate),
            slot: "morning",
            bookingAmount: 800,
            status: "confirmed",
        })
    );
    await repos.paymentRepo.create(
        Payment.create({
            bookingId: bk1.id!,
            userId: "user_1",
            mechanicId: "mech_1",
            amount: 800,
            amountPaise: 80000,
            currency: "INR",
            razorpayOrderId: "order_hist_1",
            status: "paid",
            idempotencyKey: "k_hist_1",
        })
    );

    await repos.bookingRepo.create(
        Booking.create({
            userId: "user_1",
            vehicleId: "veh_1",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Battery Jumpstart",
            serviceAddress: "MG Road, Kochi",
            scheduledDate: new Date(getFutureDateIso(4)),
            slot: "afternoon",
            bookingAmount: 800,
            status: "completed",
        })
    );

    await repos.bookingRepo.create(
        Booking.create({
            userId: "user_2",
            vehicleId: "veh_1",
            mechanicId: "mech_1",
            bookingType: "scheduled",
            serviceType: "Engine Repair",
            serviceAddress: "Other Addr",
            scheduledDate: new Date(getFutureDateIso(5)),
            slot: "morning",
            bookingAmount: 800,
            status: "confirmed",
        })
    );

    const getMyBookingsUC = new GetMyBookingsUseCase(
        repos.bookingRepo,
        repos.vehicleRepo,
        repos.userRepo,
        repos.appRepo,
        repos.paymentRepo
    );

    const allRes = await getMyBookingsUC.execute("user_1", {
        page: 1,
        limit: 10,
        category: "all",
    });

    assert.equal(allRes.bookings.length, 2);
    assert.equal(allRes.counts.all, 2);
    assert.equal(allRes.counts.upcoming, 1);
    assert.equal(allRes.counts.completed, 1);
    assert.equal(allRes.counts.cancelled, 0);

    const first = allRes.bookings[0]!;
    assert.equal(first.vehicle?.brand, "Honda");
    assert.equal(first.vehicle?.registrationNumber, "KL01AB1234");
    assert.equal(first.mechanic?.fullName, "Mechanic Near");
    assert.equal(first.paymentStatus, "paid");

    const completedOnly = await getMyBookingsUC.execute("user_1", {
        category: "completed",
    });
    assert.equal(completedOnly.bookings.length, 1);
    assert.equal(completedOnly.bookings[0]?.serviceType, "Battery Jumpstart");
});
