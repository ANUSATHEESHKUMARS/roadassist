import test from "node:test";
import assert from "node:assert/strict";

import { User } from "../src/domain/User/entities/User.js";
import { Vehicle } from "../src/domain/vehilce/Vehilce.js";
import { MechanicApplication } from "../src/domain/User/entities/MechanicApplication.js";
import {
    DailySchedule,
    MechanicSchedule,
} from "../src/domain/User/entities/MechanicSchedule.js";
import { Booking, BookingProps } from "../src/domain/User/entities/Booking.js";
import { BookingSlot, BookingStatus } from "../src/domain/User/Types/BookingTypes.js";

import { IUserRepository } from "../src/domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../src/domain/repositories/IVehicleRepository.js";
import { IMechanicApplicationRepository } from "../src/domain/repositories/IMechanicApplicationRepository.js";
import { IMechanicScheduleRepository } from "../src/domain/repositories/IMechanicScheduleRepository.js";
import { IBookingRepository } from "../src/domain/repositories/IBookingRepository.js";
import { IMechanicSpecializationValidator } from "../src/application/validators/interfaces/IMechanicSpecializationValidator.js";
import { ITransactionManager } from "../src/infrastructure/databases/interface/IMongoTransactionManger.js";
import { ITransactionContext } from "../src/infrastructure/databases/interface/ITransactionContext.js";

import { MechanicScheduleValidator } from "../src/application/validators/MechanicScheduleValidator.js";
import { MechanicAvailabilityResolver } from "../src/application/services/MechanicAvailabilityResolver.js";
import { MechanicLocationResolver } from "../src/application/services/MechanicLocationResolver.js";
import { MechanicServiceCompatibility } from "../src/application/services/MechanicServiceCompatibility.js";
import { MechanicCategory } from "../src/domain/User/entities/MechanicCategory.js";
import { IMechanicCategoryRepository } from "../src/domain/repositories/admin/IMechanicCategoryRepository.js";
import { CreateMechanicScheduleUseCase } from "../src/application/useCase/mechanic/CreateMechanicScheduleUseCase.js";
import { UpdateMechanicScheduleUseCase } from "../src/application/useCase/mechanic/UpdateMechanicScheduleUseCase.js";
import { GetMechanicScheduleUseCase } from "../src/application/useCase/mechanic/GetMechanicSceduleUseCase.js";
import { DiscoverAvailableMechanicsUseCase } from "../src/application/useCase/booking/DiscoverAvailableMechanicsUseCase.js";
import { CreateBookingReservationUseCase } from "../src/application/useCase/booking/CreateBookingReservationUseCase.js";
import { SaveMechanicDraftUseCase } from "../src/application/useCase/mechanic/SaveMechanicApplicaitonDraftuseCase.js";
import { SubmitMechanicApplicationUseCase } from "../src/application/useCase/mechanic/SubmitMechanicApplicationUseCase.js";
import { ApproveMechanicApplicationUseCase } from "../src/application/useCase/admin/ApproveMechanicApplicationUseCase.js";
import { GetMyMechanicApplicationUseCase } from "../src/application/useCase/mechanic/GetMyMechanicApplicationUseCase.js";
import { MechanicApplicationController } from "../src/presentation/controllers/mechanic/SaveMechanicDraftController.js";
import { MechanicApplicationValidator } from "../src/application/validators/MechanicApplicationValidaor.js";
import { MechanicApplicationMapper } from "../src/application/mappers/MechanicApplicationMapper.js";
import { BookingMapper } from "../src/application/mappers/BookingMapper.js";
import {
    getIndiaDateParts,
    getIndiaDayKey,
    parseIndiaDateKeyToDate,
} from "../src/shared/utils/timezone.js";

class FakeTransactionManager implements ITransactionManager {
    async execute<T>(operation: (tx: ITransactionContext) => Promise<T>): Promise<T> {
        return operation({});
    }
}

function getFutureDateKey(daysAhead: number): string {
    const d = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return getIndiaDayKey(d);
}

function getPastDateKey(daysBack = 3): string {
    const d = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
    return getIndiaDayKey(d);
}

function buildWeeklySchedule(
    overrides: Partial<Record<DailySchedule["day"], { morning: boolean; afternoon: boolean }>> = {}
): DailySchedule[] {
    const days: DailySchedule["day"][] = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];
    return days.map((day) => ({
        day,
        morning: overrides[day]?.morning ?? true,
        afternoon: overrides[day]?.afternoon ?? true,
    }));
}

function createHarness() {
    const users = new Map<string, User>();
    const vehicles = new Map<string, Vehicle>();
    const applications = new Map<string, MechanicApplication>();
    const schedules = new Map<string, MechanicSchedule>();
    const bookings = new Map<string, Booking>();
    let seq = 1;
    const nextId = (p: string) => `${p}_${seq++}`;

    const isSlotConflict = (a: BookingSlot, b: BookingSlot) =>
        a === b || a === "full_day" || b === "full_day";

    const isBlocking = (b: Booking, now: Date) => {
        if (["pending", "accepted", "confirmed", "in_progress"].includes(b.status)) {
            return true;
        }
        return (
            b.status === "pending_payment" &&
            Boolean(b.reservationExpiresAt && b.reservationExpiresAt > now)
        );
    };

    const userRepo: IUserRepository = {
        async save(u) {
            users.set(u.userId!, u);
            return u;
        },
        async findbyemail() { return null; },
        async findAll() { return [...users.values()]; },
        async createGoogleUser() { throw new Error("not implemented"); },
        async findById(id) { return users.get(id) ?? null; },
        async updateStatus() { return null; },
        async updatePassword() { return null; },
        async addRole(userId, role) {
            const u = users.get(userId);
            if (!u) return null;
            if (!u.roles.includes(role)) {
                u.roles.push(role);
            }
            return u;
        },
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
        async create(app) {
            const id = app.id ?? nextId("app");
            const props = {
                id,
                userId: app.userId,
                status: app.status,
                specializations: app.specializations,
                supportedVehicleTypes: app.supportedVehicleTypes,
                serviceOffered: app.serviceOffered,
                documents: app.documents,
                ...(app.profilePhotoKey !== undefined && { profilePhotoKey: app.profilePhotoKey }),
                ...(app.experienceYears !== undefined && { experienceYears: app.experienceYears }),
                ...(app.professionalDescription !== undefined && { professionalDescription: app.professionalDescription }),
                ...(app.serviceModel !== undefined && { serviceModel: app.serviceModel }),
                ...(app.serviceAddress !== undefined && { serviceAddress: app.serviceAddress }),
                ...(app.pincode !== undefined && { pincode: app.pincode }),
                ...(app.latitude !== undefined && { latitude: app.latitude }),
                ...(app.longitude !== undefined && { longitude: app.longitude }),
                ...(app.locationSource !== undefined && { locationSource: app.locationSource }),
                ...(app.serviceRadiusKm !== undefined && { serviceRadiusKm: app.serviceRadiusKm }),
                ...(app.workshopName !== undefined && { workshopName: app.workshopName }),
                ...(app.workshopAddress !== undefined && { workshopAddress: app.workshopAddress }),
                ...(app.workshopLatitude !== undefined && { workshopLatitude: app.workshopLatitude }),
                ...(app.workshopLongitude !== undefined && { workshopLongitude: app.workshopLongitude }),
                ...(app.workshopLocationSource !== undefined && { workshopLocationSource: app.workshopLocationSource }),
            };
            const created = new MechanicApplication(props);
            applications.set(app.userId, created);
            return created;
        },
        async findById(id) {
            return [...applications.values()].find((a) => a.id === id) ?? null;
        },
        async findByUserId(userId) {
            return applications.get(userId) ?? null;
        },
        async update(applicationId, application) {
            const existing = [...applications.values()].find((a) => a.id === applicationId);
            if (!existing) return null;
            applications.set(application.userId, application);
            return application;
        },
        async updateServiceLocation() { return null; },
        async findByStatus(status) {
            return [...applications.values()].filter((a) => a.status === status);
        },
        async findByUserIds(ids) {
            return ids.map((id) => applications.get(id)).filter((a): a is MechanicApplication => Boolean(a));
        },
    };

    const scheduleRepo: IMechanicScheduleRepository = {
        async create(schedule) {
            const created = new MechanicSchedule(
                schedule.mechanicId,
                schedule.weeklyAvailability,
                schedule.morningStartTime,
                schedule.morningEndTime,
                schedule.afternoonStartTime,
                schedule.afternoonEndTime,
                schedule.isActive,
                nextId("sched"),
                new Date(),
                new Date(),
                schedule.dateAvailability ?? []
            );
            schedules.set(schedule.mechanicId, created);
            return created;
        },
        async findByMechanicId(mechanicId) {
            return schedules.get(mechanicId) ?? null;
        },
        async update(mechanicId, partial) {
            const existing = schedules.get(mechanicId);
            if (!existing) return null;
            const updated = new MechanicSchedule(
                existing.mechanicId,
                partial.weeklyAvailability ?? existing.weeklyAvailability,
                partial.morningStartTime ?? existing.morningStartTime,
                partial.morningEndTime ?? existing.morningEndTime,
                partial.afternoonStartTime ?? existing.afternoonStartTime,
                partial.afternoonEndTime ?? existing.afternoonEndTime,
                partial.isActive !== undefined ? partial.isActive : existing.isActive,
                existing.id,
                existing.createdAt,
                new Date(),
                partial.dateAvailability ?? existing.dateAvailability
            );
            schedules.set(mechanicId, updated);
            return updated;
        },
        async findActiveByMechanicIds(ids) {
            return ids
                .map((id) => schedules.get(id))
                .filter((s): s is MechanicSchedule => Boolean(s && s.isActive));
        },
    };

    const bookingRepo: IBookingRepository = {
        async create(booking) {
            const id = booking.id ?? nextId("bk");
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
            const saved = Booking.create({ ...booking.toObject(), id });
            bookings.set(id, saved);
            return saved;
        },
        async findById(id) { return bookings.get(id) ?? null; },
        async findByIdAndUserId(id, userId) {
            const b = bookings.get(id);
            return b && b.userId === userId ? b : null;
        },
        async findByUserId(userId) {
            return [...bookings.values()].filter((b) => b.userId === userId);
        },
        async countByUserId(userId) {
            return [...bookings.values()].filter((b) => b.userId === userId).length;
        },
        async findByMechanicId(mechanicId) {
            return [...bookings.values()].filter((b) => b.mechanicId === mechanicId);
        },
        async findConflictingBooking(mechanicId, scheduledDate, slot, excludeId) {
            const now = new Date();
            const targetDay = getIndiaDateParts(scheduledDate);
            for (const b of bookings.values()) {
                if (excludeId && b.id === excludeId) continue;
                if (b.mechanicId !== mechanicId) continue;
                if (!isBlocking(b, now)) continue;
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
                    isBlocking(b, now)
            );
        },
        async updateStatus(id, status: BookingStatus, extra?: Partial<BookingProps>) {
            const existing = bookings.get(id);
            if (!existing) return null;
            const updated = Booking.create({ ...existing.toObject(), ...extra, status });
            bookings.set(id, updated);
            return updated;
        },
        async attachPaymentId() { return null; },
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

    const txManager = new FakeTransactionManager();

    users.set(
        "cust_1",
        new User("Customer One", "cust@test.com", "9999999999", undefined, ["user"], "cust_1", undefined, "LOCAL", "active", "user")
    );
    users.set(
        "mech_1",
        new User("Mechanic One", "mech1@test.com", "8888888888", undefined, ["user", "mechanic"], "mech_1", undefined, "LOCAL", "active", "mechanic")
    );
    vehicles.set(
        "veh_1",
        new Vehicle("cust_1", "KL01AB1234", "car", "Honda", "City", 2023, "petrol", "White", undefined, undefined, undefined, "veh_1")
    );

    return {
        users,
        vehicles,
        applications,
        schedules,
        bookings,
        userRepo,
        vehicleRepo,
        appRepo,
        scheduleRepo,
        bookingRepo,
        txManager,
    };
}

// ─── 1. Calendar Availability & Validation ────────────────────────────────────

test("Calendar availability: weekly fallback, date override, unavailable date, custom timings, derived full day, and remove override", async () => {
    const h = createHarness();
    const createUC = new CreateMechanicScheduleUseCase(h.scheduleRepo);
    const updateUC = new UpdateMechanicScheduleUseCase(h.scheduleRepo, h.bookingRepo);

    const dayA = getFutureDateKey(3);
    const dayB = getFutureDateKey(4);
    const dayC = getFutureDateKey(5);

    await createUC.execute("mech_1", {
        weeklyAvailability: buildWeeklySchedule(),
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
    });

    // Weekly fallback when no override exists
    const initialSchedule = await h.scheduleRepo.findByMechanicId("mech_1");
    assert.ok(initialSchedule);
    const fallbackResolved = MechanicAvailabilityResolver.resolveForDate(
        initialSchedule,
        parseIndiaDateKeyToDate(dayA)
    );
    assert.equal(fallbackResolved.source, "weekly");
    assert.equal(fallbackResolved.morning, true);
    assert.equal(fallbackResolved.afternoon, true);
    assert.equal(fallbackResolved.fullDay, true);

    // Date-specific partial override + custom timings on afternoon
    const afterOverride = await updateUC.upsertDateAvailability("mech_1", {
        date: dayA,
        isAvailable: true,
        morning: false,
        afternoon: true,
        afternoonStartTime: "15:00",
        afternoonEndTime: "19:00",
    });

    const overrideResolved = MechanicAvailabilityResolver.resolveForDate(
        afterOverride,
        parseIndiaDateKeyToDate(dayA)
    );
    assert.equal(overrideResolved.source, "date_override");
    assert.equal(overrideResolved.morning, false);
    assert.equal(overrideResolved.afternoon, true);
    assert.equal(overrideResolved.fullDay, false);
    assert.equal(overrideResolved.afternoonStartTime, "15:00");
    assert.equal(overrideResolved.afternoonEndTime, "19:00");
    // Unchanged day B still uses weekly fallback
    const dayBResolved = MechanicAvailabilityResolver.resolveForDate(
        afterOverride,
        parseIndiaDateKeyToDate(dayB)
    );
    assert.equal(dayBResolved.source, "weekly");
    assert.equal(dayBResolved.afternoonStartTime, "14:00");

    // Explicit unavailable date override
    const afterUnavailable = await updateUC.upsertDateAvailability("mech_1", {
        date: dayC,
        isAvailable: false,
        morning: false,
        afternoon: false,
    });
    const unavailResolved = MechanicAvailabilityResolver.resolveForDate(
        afterUnavailable,
        parseIndiaDateKeyToDate(dayC)
    );
    assert.equal(unavailResolved.isAvailable, false);
    assert.equal(
        MechanicAvailabilityResolver.isSlotAvailable(unavailResolved, "morning"),
        false
    );

    // Removing override restores weekly default
    const afterRemove = await updateUC.removeDateAvailability("mech_1", dayA);
    const restored = MechanicAvailabilityResolver.resolveForDate(
        afterRemove,
        parseIndiaDateKeyToDate(dayA)
    );
    assert.equal(restored.source, "weekly");
    assert.equal(restored.fullDay, true);
    assert.equal(restored.afternoonStartTime, "14:00");
});

test("Calendar validator rejects duplicate dates, past dates, invalid dates, invalid timings, and invalid shift combos", () => {
    const baseTimings = {
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
    };
    const futureDate = getFutureDateKey(4);
    const pastDate = getPastDateKey(2);

    // Duplicate date rejection
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityList(
                [
                    { date: futureDate, isAvailable: true, morning: true, afternoon: false },
                    { date: futureDate, isAvailable: false, morning: false, afternoon: false },
                ],
                baseTimings
            ),
        /Duplicate date entry/i
    );

    // Past date rejection
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityEntry(
                { date: pastDate, isAvailable: true, morning: true, afternoon: false },
                baseTimings
            ),
        /past date/i
    );

    // Invalid calendar date rejection (Feb 30)
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityEntry(
                { date: "2027-02-30", isAvailable: true, morning: true, afternoon: false },
                baseTimings
            ),
        /Invalid calendar date/i
    );

    // End time <= start time
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityEntry(
                {
                    date: futureDate,
                    isAvailable: true,
                    morning: true,
                    afternoon: false,
                    morningStartTime: "13:00",
                    morningEndTime: "10:00",
                },
                baseTimings
            ),
        /end time must be after/i
    );

    // Overlapping morning & afternoon custom timings
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityEntry(
                {
                    date: futureDate,
                    isAvailable: true,
                    morning: true,
                    afternoon: true,
                    morningStartTime: "09:00",
                    morningEndTime: "15:00",
                },
                baseTimings
            ),
        /cannot overlap/i
    );

    // Invalid shift combinations
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityEntry(
                { date: futureDate, isAvailable: false, morning: true, afternoon: false },
                baseTimings
            ),
        /Unavailable date.*cannot have morning or afternoon/i
    );
    assert.throws(
        () =>
            MechanicScheduleValidator.validateDateAvailabilityEntry(
                { date: futureDate, isAvailable: true, morning: false, afternoon: false },
                baseTimings
            ),
        /must enable morning, afternoon, or both/i
    );
});

// ─── 2. Customer Discovery, Booking Safety & Schedule Conflict Protection ─────

test("Discovery and reservation enforce date overrides, weekly fallback, conflict rules, expired reservations, and schedule-update conflict protection", async () => {
    const h = createHarness();
    h.applications.set(
        "mech_1",
        new MechanicApplication({
            id: "app_1",
            userId: "mech_1",
            status: "approved",
            supportedVehicleTypes: ["car"],
            serviceOffered: ["Engine Repair"],
            serviceModel: "mobile",
            serviceAddress: "MG Road, Kochi",
            pincode: "682016",
            latitude: 9.9312,
            longitude: 76.2673,
            serviceRadiusKm: 15,
        })
    );

    const targetOverrideDate = getFutureDateKey(5);
    const targetFallbackDate = getFutureDateKey(6);
    const unavailableDate = getFutureDateKey(7);

    const createSchedUC = new CreateMechanicScheduleUseCase(h.scheduleRepo);
    const updateSchedUC = new UpdateMechanicScheduleUseCase(h.scheduleRepo, h.bookingRepo);
    const getSchedUC = new GetMechanicScheduleUseCase(h.scheduleRepo, h.bookingRepo);
    const discoverUC = new DiscoverAvailableMechanicsUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo
    );
    const reserveUC = new CreateBookingReservationUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo,
        h.txManager
    );

    await createSchedUC.execute("mech_1", {
        weeklyAvailability: buildWeeklySchedule(),
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
        dateAvailability: [
            {
                date: targetOverrideDate,
                isAvailable: true,
                morning: false,
                afternoon: true,
                afternoonStartTime: "15:00",
                afternoonEndTime: "19:00",
            },
            {
                date: unavailableDate,
                isAvailable: false,
                morning: false,
                afternoon: false,
            },
        ],
    });

    // On override date: morning blocked, full_day blocked, afternoon available with custom timings
    const morningDiscover = await discoverUC.execute("cust_1", {
        scheduledDate: targetOverrideDate,
        slot: "morning",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.935,
        longitude: 76.27,
    });
    assert.equal(morningDiscover.mechanics.length, 0);

    const fullDayDiscover = await discoverUC.execute("cust_1", {
        scheduledDate: targetOverrideDate,
        slot: "full_day",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.935,
        longitude: 76.27,
    });
    assert.equal(fullDayDiscover.mechanics.length, 0);

    await assert.rejects(
        () =>
            reserveUC.execute("cust_1", {
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                serviceAddress: "Kochi",
                scheduledDate: targetOverrideDate,
                slot: "morning",
                latitude: 9.935,
                longitude: 76.27,
            }),
        /not available for the selected shift/i
    );

    const afternoonDiscover = await discoverUC.execute("cust_1", {
        scheduledDate: targetOverrideDate,
        slot: "afternoon",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.935,
        longitude: 76.27,
    });
    assert.equal(afternoonDiscover.mechanics.length, 1);
    assert.equal(afternoonDiscover.mechanics[0]?.afternoonStartTime, "15:00");
    assert.equal(afternoonDiscover.mechanics[0]?.afternoonEndTime, "19:00");

    // Unavailable date blocks discovery and reservation
    await assert.rejects(
        () =>
            reserveUC.execute("cust_1", {
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                serviceAddress: "Kochi",
                scheduledDate: unavailableDate,
                slot: "morning",
                latitude: 9.935,
                longitude: 76.27,
            }),
        /not available on this day/i
    );

    // Weekly fallback date allows full_day
    const fallbackDiscover = await discoverUC.execute("cust_1", {
        scheduledDate: targetFallbackDate,
        slot: "full_day",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.935,
        longitude: 76.27,
    });
    assert.equal(fallbackDiscover.mechanics.length, 1);

    // Reserve afternoon on override date
    const reservation = await reserveUC.execute("cust_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "Kochi",
        scheduledDate: targetOverrideDate,
        slot: "afternoon",
        latitude: 9.935,
        longitude: 76.27,
    });
    assert.equal(reservation.status, "pending_payment");

    // Booked dates query for calendar reflects active reservation
    const bookedDates = await getSchedUC.getBookedDates(
        "mech_1",
        targetOverrideDate.slice(0, 7)
    );
    assert.ok(
        bookedDates.some(
            (b) => b.date === targetOverrideDate && b.slot === "afternoon"
        )
    );

    // Mechanic tries to mark overrideDate unavailable while active reservation exists -> ConflictError
    await assert.rejects(
        () =>
            updateSchedUC.upsertDateAvailability("mech_1", {
                date: targetOverrideDate,
                isAvailable: false,
                morning: false,
                afternoon: false,
            }),
        /Cannot update schedule/i
    );

    // Mechanic tries to deactivate whole schedule while active reservation exists -> ConflictError
    await assert.rejects(
        () => updateSchedUC.execute("mech_1", { isActive: false }),
        /Cannot update schedule/i
    );

    // Force-expire the reservation (simulating expired doc before TTL deletes it)
    const existingBk = h.bookings.get(reservation.bookingId)!;
    h.bookings.set(
        reservation.bookingId,
        Booking.create({
            ...existingBk.toObject(),
            reservationExpiresAt: new Date(Date.now() - 60_000),
        })
    );

    // Now expired reservation no longer blocks slot or schedule override
    const afterExpiry = await updateSchedUC.upsertDateAvailability("mech_1", {
        date: targetOverrideDate,
        isAvailable: false,
        morning: false,
        afternoon: false,
    });
    assert.equal(
        afterExpiry.dateAvailability.find((d) => d.date === targetOverrideDate)?.isAvailable,
        false
    );
});

// ─── 3. Mechanic Application Location Capture, Normalization & Service Models ─

test("Mechanic application location: numeric string normalization, exact coordinate persistence through submit/approve/getMy, and workshop/both discovery", async () => {
    const h = createHarness();
    h.users.set(
        "mech_app",
        new User("Workshop Pro", "w@test.com", "7777777777", undefined, ["user"], "mech_app", undefined, "LOCAL", "active", "user")
    );
    h.users.set(
        "admin_1",
        new User("Admin", "admin@test.com", "6666666666", undefined, ["admin"], "admin_1", undefined, "LOCAL", "active", "admin")
    );

    const appValidator = new MechanicApplicationValidator();
    const specValidator: IMechanicSpecializationValidator = {
        async validate() {
            return;
        },
    };
    const saveDraftUC = new SaveMechanicDraftUseCase(h.appRepo, appValidator, specValidator);
    const submitUC = new SubmitMechanicApplicationUseCase(h.appRepo, appValidator, specValidator);
    const approveUC = new ApproveMechanicApplicationUseCase(h.appRepo, h.userRepo, h.txManager);
    const getMyUC = new GetMyMechanicApplicationUseCase(h.appRepo);
    const controller = new MechanicApplicationController(
        saveDraftUC,
        submitUC,
        getMyUC,
        {} as never
    );

    // Invalid coordinates rejected
    await assert.rejects(
        () =>
            saveDraftUC.execute("mech_app", {
                latitude: "invalid-lat",
                longitude: "76.27",
            }),
        /Latitude must be between -90 and 90/i
    );

    // Save draft with numeric-string GPS mobile coords & distinct workshop coords ("both")
    const savedDraft = await saveDraftUC.execute("mech_app", {
        profilePhotoKey: "profiles/p1.jpg",
        experienceYears: 5,
        specializations: [{ categoryId: "cat_1", subcategoryIds: ["sub_1"] }],
        supportedVehicleTypes: ["car"],
        serviceOffered: ["Engine Repair"],
        serviceModel: "both",
        serviceAddress: "Aluva, Kochi",
        pincode: "683101",
        latitude: "10.100400",
        longitude: "76.357000",
        locationSource: "gps",
        serviceRadiusKm: "8",
        workshopName: "Vyttila Auto Studio",
        workshopAddress: "Vyttila Hub, Kochi",
        workshopLatitude: "9.965800",
        workshopLongitude: "76.318300",
        workshopLocationSource: "map",
        documents: [
            {
                documentType: "id_proof",
                fileKey: "docs/1.pdf",
                originalName: "id.pdf",
                mimeType: "application/pdf",
                verificationStatus: "pending",
            },
            {
                documentType: "mechanic_certificate",
                fileKey: "docs/2.pdf",
                originalName: "cert.pdf",
                mimeType: "application/pdf",
                verificationStatus: "pending",
            },
        ],
    });

    assert.equal(typeof savedDraft.latitude, "number");
    assert.equal(savedDraft.latitude, 10.1004);
    assert.equal(savedDraft.longitude, 76.357);
    assert.equal(savedDraft.locationSource, "gps");
    assert.equal(savedDraft.workshopLatitude, 9.9658);
    assert.equal(savedDraft.workshopLongitude, 76.3183);
    assert.equal(savedDraft.workshopLocationSource, "map");

    // Submit application
    const submitted = await submitUC.execute("mech_app");
    assert.equal(submitted.status, "pending");
    assert.equal(submitted.workshopLatitude, 9.9658);

    // Mark specialization approved before admin approval
    const updatedApp = new MechanicApplication({
        id: submitted.id!,
        userId: submitted.userId,
        status: "pending",
        specializations: [
            {
                categoryId: "cat_1",
                subcategories: [{ subcategoryId: "sub_1", verificationStatus: "approved" }],
            },
        ],
        supportedVehicleTypes: submitted.supportedVehicleTypes,
        serviceOffered: submitted.serviceOffered,
        documents: submitted.documents,
        ...(submitted.profilePhotoKey !== undefined && { profilePhotoKey: submitted.profilePhotoKey }),
        ...(submitted.experienceYears !== undefined && { experienceYears: submitted.experienceYears }),
        ...(submitted.serviceModel !== undefined && { serviceModel: submitted.serviceModel }),
        ...(submitted.serviceAddress !== undefined && { serviceAddress: submitted.serviceAddress }),
        ...(submitted.pincode !== undefined && { pincode: submitted.pincode }),
        ...(submitted.latitude !== undefined && { latitude: submitted.latitude }),
        ...(submitted.longitude !== undefined && { longitude: submitted.longitude }),
        ...(submitted.locationSource !== undefined && { locationSource: submitted.locationSource }),
        ...(submitted.serviceRadiusKm !== undefined && { serviceRadiusKm: submitted.serviceRadiusKm }),
        ...(submitted.workshopName !== undefined && { workshopName: submitted.workshopName }),
        ...(submitted.workshopAddress !== undefined && { workshopAddress: submitted.workshopAddress }),
        ...(submitted.workshopLatitude !== undefined && { workshopLatitude: submitted.workshopLatitude }),
        ...(submitted.workshopLongitude !== undefined && { workshopLongitude: submitted.workshopLongitude }),
        ...(submitted.workshopLocationSource !== undefined && { workshopLocationSource: submitted.workshopLocationSource }),
    });
    await h.appRepo.update(submitted.id!, updatedApp);

    // Admin approves -> workshop coordinates and locationSource are preserved
    const approved = await approveUC.execute(submitted.id!, "admin_1");
    assert.equal(approved.status, "approved");
    assert.equal(approved.latitude, 10.1004);
    assert.equal(approved.workshopLatitude, 9.9658);
    assert.equal(approved.locationSource, "gps");
    assert.equal(approved.workshopLocationSource, "map");

    // Mapper/Controller getMyApplication returns exact coordinates
    let responseBody: unknown = null;
    await controller.getMyApplication(
        { user: { userId: "mech_app" } } as never,
        {
            status() {
                return {
                    json(body: unknown) {
                        responseBody = body;
                    },
                };
            },
        } as never
    );
    const resData = (responseBody as { data: ReturnType<typeof MechanicApplicationMapper.toResponse> }).data;
    assert.equal(resData.latitude, 10.1004);
    assert.equal(resData.workshopLatitude, 9.9658);

    // Discovery using MechanicLocationResolver: customer near workshop (Vyttila ~1km) vs mobile base (~15km away)
    await new CreateMechanicScheduleUseCase(h.scheduleRepo).execute("mech_app", {
        weeklyAvailability: buildWeeklySchedule(),
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
    });

    const discoverUC = new DiscoverAvailableMechanicsUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo
    );

    const nearWorkshopDiscovery = await discoverUC.execute("cust_1", {
        scheduledDate: getFutureDateKey(3),
        slot: "morning",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 9.968,
        longitude: 76.319,
    });
    assert.equal(nearWorkshopDiscovery.mechanics.length, 1);
    assert.ok(nearWorkshopDiscovery.mechanics[0]!.distanceKm < 1);

    // Workshop-mode filter excludes mobile-only, matches workshop coords
    const mobileOnlyFilter = MechanicLocationResolver.resolveForCustomer(
        approved,
        9.968,
        76.319,
        "mobile"
    );
    assert.equal(mobileOnlyFilter, null); // > 8km from Aluva mobile base
    const workshopFilter = MechanicLocationResolver.resolveForCustomer(
        approved,
        9.968,
        76.319,
        "workshop"
    );
    assert.ok(workshopFilter);
    assert.equal(workshopFilter.matchedModel, "workshop");

    // Concurrent reservation attempts on available date allow at most one reservation
    h.users.set(
        "cust_2",
        new User("Customer Two", "cust2@test.com", "5555555555", undefined, ["user"], "cust_2", undefined, "LOCAL", "active", "user")
    );
    h.vehicles.set(
        "veh_2",
        new Vehicle("cust_2", "KL01CD5678", "car", "Hyundai", "i20", 2024, "petrol", "Black", undefined, undefined, undefined, "veh_2")
    );
    const reserveUC = new CreateBookingReservationUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo,
        h.txManager
    );
    const concurrentDate = getFutureDateKey(4);
    const results = await Promise.allSettled([
        reserveUC.execute("cust_1", {
            mechanicId: "mech_app",
            vehicleId: "veh_1",
            serviceType: "Engine Repair",
            serviceAddress: "Vyttila",
            scheduledDate: concurrentDate,
            slot: "morning",
            latitude: 9.968,
            longitude: 76.319,
        }),
        reserveUC.execute("cust_2", {
            mechanicId: "mech_app",
            vehicleId: "veh_2",
            serviceType: "Engine Repair",
            serviceAddress: "Vyttila",
            scheduledDate: concurrentDate,
            slot: "full_day",
            latitude: 9.968,
            longitude: 76.319,
        }),
    ]);
    const fulfilledCount = results.filter((r) => r.status === "fulfilled").length;
    assert.equal(fulfilledCount, 1);
});

// ─── 4. Approved Specializations Service Compatibility ────────────────────────

test("Discovery and reservation match approved category/subcategory specializations when serviceOffered text differs, while rejecting unapproved/unselected services", async () => {
    const h = createHarness();

    const engineCategory = new MechanicCategory({
        id: "cat_eng",
        name: "Engine & Mechanical Repair",
        slug: "engine-mechanical-repair",
        isActive: true,
        subcategories: [
            {
                id: "sub_diag",
                name: "Engine Diagnostics",
                slug: "engine-diagnostics",
                isActive: true,
            },
            {
                id: "sub_repair",
                name: "Engine Repair",
                slug: "engine-repair",
                isActive: true,
            },
            {
                id: "sub_trans",
                name: "Transmission Repair",
                slug: "transmission-repair",
                isActive: true,
            },
        ],
    });

    const categoryRepo: IMechanicCategoryRepository = {
        async create(c) { return c; },
        async findById(id) { return id === "cat_eng" ? engineCategory : null; },
        async findBySlug() { return null; },
        async findAll() { return [engineCategory]; },
        async update() { return null; },
        async updateStatus() { return null; },
    };

    // Replicate exact Sreekaryam / Kazhakkoottam scenario
    h.applications.set(
        "mech_1",
        new MechanicApplication({
            id: "app_sreekaryam",
            userId: "mech_1",
            status: "approved",
            supportedVehicleTypes: ["car", "auto", "bike", "ev"],
            serviceOffered: ["custom-note"],
            specializations: [
                {
                    categoryId: "cat_eng",
                    subcategories: [
                        { subcategoryId: "sub_diag", verificationStatus: "approved" },
                        { subcategoryId: "sub_repair", verificationStatus: "approved" },
                        { subcategoryId: "sub_trans", verificationStatus: "pending" },
                    ],
                },
            ],
            serviceModel: "mobile",
            serviceAddress: "Sreekaryam, Thiruvananthapuram",
            pincode: "695017",
            latitude: 8.5489489,
            longitude: 76.9171867,
            serviceRadiusKm: 20,
        })
    );

    const targetDate = getFutureDateKey(2);
    await new CreateMechanicScheduleUseCase(h.scheduleRepo).execute("mech_1", {
        weeklyAvailability: buildWeeklySchedule(),
        morningStartTime: "09:00",
        morningEndTime: "13:00",
        afternoonStartTime: "14:00",
        afternoonEndTime: "18:00",
        dateAvailability: [
            {
                date: targetDate,
                isAvailable: true,
                morning: false,
                afternoon: true,
            },
        ],
    });

    assert.equal(
        MechanicServiceCompatibility.offersService(
            h.applications.get("mech_1")!,
            "Engine Repair",
            [engineCategory]
        ),
        true
    );
    assert.equal(
        MechanicServiceCompatibility.offersService(
            h.applications.get("mech_1")!,
            "Transmission Repair",
            [engineCategory]
        ),
        false
    );

    const discoverUC = new DiscoverAvailableMechanicsUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo,
        categoryRepo
    );
    const reserveUC = new CreateBookingReservationUseCase(
        h.userRepo,
        h.vehicleRepo,
        h.appRepo,
        h.scheduleRepo,
        h.bookingRepo,
        h.txManager,
        categoryRepo
    );

    // Afternoon discovery succeeds for "Engine Repair" with exact ~5.27 km distance
    const afternoonRes = await discoverUC.execute("cust_1", {
        scheduledDate: targetDate,
        slot: "afternoon",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        latitude: 8.566324,
        longitude: 76.872579,
    });
    assert.equal(afternoonRes.mechanics.length, 1);
    assert.equal(afternoonRes.mechanics[0]?.mechanicId, "mech_1");
    assert.equal(afternoonRes.mechanics[0]?.distanceKm, 5.27);

    // Pending/unapproved subcategory ("Transmission Repair") is still excluded
    const pendingSpecRes = await discoverUC.execute("cust_1", {
        scheduledDate: targetDate,
        slot: "afternoon",
        vehicleId: "veh_1",
        serviceType: "Transmission Repair",
        latitude: 8.566324,
        longitude: 76.872579,
    });
    assert.equal(pendingSpecRes.mechanics.length, 0);

    // Morning & Full Day rejected by both discovery and reservation
    await assert.rejects(
        () =>
            reserveUC.execute("cust_1", {
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                serviceAddress: "Kazhakkoottam",
                scheduledDate: targetDate,
                slot: "morning",
                latitude: 8.566324,
                longitude: 76.872579,
            }),
        /not available for the selected shift/i
    );
    await assert.rejects(
        () =>
            reserveUC.execute("cust_1", {
                mechanicId: "mech_1",
                vehicleId: "veh_1",
                serviceType: "Engine Repair",
                serviceAddress: "Kazhakkoottam",
                scheduledDate: targetDate,
                slot: "full_day",
                latitude: 8.566324,
                longitude: 76.872579,
            }),
        /not available for the selected shift/i
    );

    // Valid afternoon reservation succeeds
    const reservation = await reserveUC.execute("cust_1", {
        mechanicId: "mech_1",
        vehicleId: "veh_1",
        serviceType: "Engine Repair",
        serviceAddress: "Kazhakkoottam",
        scheduledDate: targetDate,
        slot: "afternoon",
        latitude: 8.566324,
        longitude: 76.872579,
    });
    assert.equal(reservation.status, "pending_payment");
    assert.equal(reservation.slot, "afternoon");
});
