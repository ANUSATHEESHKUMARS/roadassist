import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { EventEmitter } from "node:events";

import { User } from "../src/domain/User/entities/User.js";
import { Vehicle } from "../src/domain/vehilce/Vehilce.js";
import { MechanicApplication } from "../src/domain/User/entities/MechanicApplication.js";
import { MechanicAvailability } from "../src/domain/User/entities/MechanicAvailability.js";
import { MechanicCategory } from "../src/domain/User/entities/MechanicCategory.js";
import {
    EmergencyRequest,
    EmergencyRequestStatus,
} from "../src/domain/User/entities/EmergencyRequest.js";
import {
    EmergencyEstimate,
    EmergencyEstimateProps,
    EmergencyEstimateStatus,
    EmergencyInspection,
    EmergencyInspectionProps,
    EmergencyInspectionStatus,
    EmergencyPayment,
    EmergencyPaymentProps,
    EmergencyPaymentStatus,
    EmergencyRepair,
    EmergencyRepairProps,
    EmergencyRepairStatus,
    RepairProgressLog,
} from "../src/domain/User/entities/EmergencyWorkflow.js";

import type { IUserRepository } from "../src/domain/repositories/IUserRepository.js";
import type { IVehicleRepository } from "../src/domain/repositories/IVehicleRepository.js";
import type { IMechanicApplicationRepository } from "../src/domain/repositories/IMechanicApplicationRepository.js";
import type { IMechanicAvailabilityRepository } from "../src/domain/repositories/IMechanicAvailabilityRepository.js";
import type { IMechanicCategoryRepository } from "../src/domain/repositories/admin/IMechanicCategoryRepository.js";
import type { IBookingRepository } from "../src/domain/repositories/IBookingRepository.js";
import type { IEmergencyRequestRepository } from "../src/domain/repositories/IEmergencyRequestRepository.js";
import type {
    IEmergencyEstimateRepository,
    IEmergencyInspectionRepository,
    IEmergencyPaymentRepository,
    IEmergencyRepairRepository,
} from "../src/domain/repositories/IEmergencyWorkflowRepositories.js";
import type { IPaymentRepository } from "../src/domain/repositories/IPaymentRepository.js";
import type { ITransactionManager } from "../src/infrastructure/databases/interface/IMongoTransactionManger.js";
import type { ITransactionContext } from "../src/infrastructure/databases/interface/ITransactionContext.js";
import type {
    CreateOrderInput,
    CreateOrderResult,
    FetchPaymentResult,
    IPaymentGateway,
    RefundPaymentInput,
    RefundPaymentResult,
    VerifySignatureInput,
} from "../src/application/contracts/IPaymentGateway.js";
import type { IMechanicLocationStore } from "../src/application/interfaces/mechanic/IMechanicLocationStore.js";
import type {
    EmergencyMechanicSummary,
    EmergencyVehicleBadge,
    IMechanicNotificationService,
} from "../src/application/interfaces/mechanic/IMechanicNotificationService.js";
import type { StoredMechanicLocation } from "../src/application/dtos/mechanic/MechanicLiveLocationDto.js";

import { CreateEmerencyRequestValidator } from "../src/application/validators/CreateEmergencyRequestValidator.js";
import { CreateEmergencyRequestUseCase } from "../src/application/useCase/emergency/CreateEmergencyRequestUseCase.js";
import { GetNearbyEmergencyRequestsUseCase } from "../src/application/useCase/mechanic/GetNearbyEmergencyRequestsUseCase.js";
import { AcceptEmergencyRequestUseCase } from "../src/application/useCase/mechanic/AcceptEmergencyRequestUseCase.js";
import { StartEmergencyTravelUseCase } from "../src/application/useCase/mechanic/StartEmergencyTravelUseCase.js";
import { ConfirmArrivalUseCase } from "../src/application/useCase/mechanic/ConfirmArrivalUseCase.js";
import { UpdateMechanicLiveLocationUseCase } from "../src/application/useCase/mechanic/UpdateMechanicLiveLocationUseCase.js";
import { JoinEmergencyTrackingUseCase } from "../src/application/useCase/user/JoinEmergencyTrackingUseCase.js";
import { CancelEmergencyRequestUseCase } from "../src/application/useCase/emergency/CancelEmergencyRequestUseCase.js";
import {
    CompleteEmergencyInspectionUseCase,
    StartEmergencyInspectionUseCase,
} from "../src/application/useCase/emergency/EmergencyInspectionUseCases.js";
import {
    ApproveEmergencyEstimateUseCase,
    RejectEmergencyEstimateUseCase,
    SubmitEmergencyEstimateUseCase,
} from "../src/application/useCase/emergency/EmergencyEstimateUseCases.js";
import {
    CreateEmergencyPaymentOrderUseCase,
    EmergencyPaymentSettlementHelper,
    VerifyEmergencyPaymentUseCase,
} from "../src/application/useCase/emergency/EmergencyPaymentUseCases.js";
import {
    CompleteEmergencyRepairUseCase,
    StartEmergencyRepairUseCase,
    UpdateEmergencyRepairProgressUseCase,
} from "../src/application/useCase/emergency/EmergencyRepairUseCases.js";
import { GetEmergencyServiceReportUseCase } from "../src/application/useCase/emergency/GetEmergencyServiceReportUseCase.js";
import { HandlePaymentWebhookUseCase } from "../src/application/useCase/booking/HandlePaymentWebhookUseCase.js";
import { PaymentSettlementHelper } from "../src/application/useCase/booking/PaymentSettlementHelper.js";
import { EmergencyCallSocketHandler } from "../src/presentation/socket/EmergencyCallSocketHandler.js";
import { calculateDistanceKm } from "../src/shared/utils/haversine.js";

const WEBHOOK_SECRET = "emergency_webhook_secret";

class FakeTransactionManager implements ITransactionManager {
    async execute<T>(work: (context: ITransactionContext) => Promise<T>): Promise<T> {
        return work({});
    }
}

class InMemoryLocationStore implements IMechanicLocationStore {
    public store = new Map<string, StoredMechanicLocation>();
    public deletedIds: string[] = [];

    async save(location: StoredMechanicLocation): Promise<void> {
        this.store.set(location.requestId, location);
    }

    async get(requestId: string): Promise<StoredMechanicLocation | null> {
        return this.store.get(requestId) ?? null;
    }

    async delete(requestId: string): Promise<void> {
        this.deletedIds.push(requestId);
        this.store.delete(requestId);
    }
}

class RecordingNotificationService implements IMechanicNotificationService {
    public newRequestEvents: Array<{
        mechanicId: string;
        requestId: string | undefined;
        distanceKm: number | undefined;
        vehicleSummary: EmergencyVehicleBadge | undefined;
    }> = [];
    public requestTakenEvents: Array<{
        requestId: string;
        assignedMechanicId: string;
    }> = [];
    public customerUpdates: Array<{
        requestId: string | undefined;
        eventName: string | undefined;
        extraPayload: Record<string, unknown> | undefined;
    }> = [];
    public mechanicUpdates: Array<{
        mechanicId: string;
        requestId: string;
        eventName: string;
    }> = [];

    async notifyNewEmergencyRequest(
        mechanicId: string,
        request: EmergencyRequest,
        metadata?: {
            distanceKm?: number;
            vehicleSummary?: EmergencyVehicleBadge;
        }
    ): Promise<void> {
        this.newRequestEvents.push({
            mechanicId,
            requestId: request.id,
            distanceKm: metadata?.distanceKm,
            vehicleSummary: metadata?.vehicleSummary,
        });
    }

    async notifyRequestTaken(
        requestId: string,
        assignedMechanicId: string
    ): Promise<void> {
        this.requestTakenEvents.push({ requestId, assignedMechanicId });
    }

    async notifyCustomerRequestUpdated(
        request: EmergencyRequest,
        options?: {
            eventName?: string;
            mechanicDetails?: EmergencyMechanicSummary | null;
            extraPayload?: Record<string, unknown>;
        }
    ): Promise<void> {
        this.customerUpdates.push({
            requestId: request.id,
            eventName: options?.eventName,
            extraPayload: options?.extraPayload,
        });
    }

    async notifyMechanicRequestUpdated(
        mechanicId: string,
        requestId: string,
        eventName: string
    ): Promise<void> {
        this.mechanicUpdates.push({ mechanicId, requestId, eventName });
    }
}

class MockPaymentGateway implements IPaymentGateway {
    private orderCounter = 0;

    getKeyId() {
        return "rzp_test_emergency";
    }

    async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
        this.orderCounter += 1;
        return {
            orderId: `order_em_${this.orderCounter}`,
            amount: input.amountPaise,
            currency: input.currency,
            receipt: input.receipt,
            status: "created",
        };
    }

    verifyPaymentSignature(input: VerifySignatureInput): boolean {
        return input.signature === `valid_sig_${input.orderId}_${input.paymentId}`;
    }

    verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean {
        const expected = crypto
            .createHmac("sha256", WEBHOOK_SECRET)
            .update(rawBody)
            .digest("hex");
        return expected === signature;
    }

    public capturedAmounts = new Map<string, number>();

    async fetchPayment(paymentId: string): Promise<FetchPaymentResult> {
        const amount = this.capturedAmounts.get(paymentId) ?? 125000;
        const orderMatch = /^pay_for_(order_em_\d+)$/.exec(paymentId);
        return {
            paymentId,
            orderId: orderMatch?.[1] ?? "order_em_1",
            amount,
            currency: "INR",
            status: "captured",
            captured: true,
        };
    }

    async refundPayment(_input: RefundPaymentInput): Promise<RefundPaymentResult> {
        return {
            refundId: "rfnd_em_1",
            paymentId: "pay_1",
            amount: 0,
            status: "processed",
        };
    }
}

class InMemoryEmergencyRepositories {
    public requests = new Map<string, EmergencyRequest>();
    public users = new Map<string, User>();
    public vehicles = new Map<string, Vehicle>();
    public apps = new Map<string, MechanicApplication>();
    public availabilities = new Map<string, MechanicAvailability>();
    public categories: MechanicCategory[] = [];
    public busyBookingMechanicIds = new Set<string>();
    public inspections = new Map<string, EmergencyInspection>();
    public estimates = new Map<string, EmergencyEstimate>();
    public payments = new Map<string, EmergencyPayment>();
    public repairs = new Map<string, EmergencyRepair>();

    private seq = 1;
    private nextId(prefix: string) {
        this.seq += 1;
        return `${prefix}_${this.seq}`;
    }

    userRepo: IUserRepository = {
        save: async (u) => u,
        findbyemail: async () => null,
        findAll: async () => Array.from(this.users.values()),
        createGoogleUser: async () => {
            throw new Error("unused");
        },
        findById: async (id) => this.users.get(id) ?? null,
        updateStatus: async () => null,
        updatePassword: async () => null,
        addRole: async () => null,
        updateActiveRole: async () => null,
        findByIds: async (ids) =>
            ids
                .map((id) => this.users.get(id))
                .filter((u): u is User => Boolean(u)),
        findIdsByNameSearch: async () => [],
    };

    vehicleRepo: IVehicleRepository = {
        create: async (v) => v,
        findByUserId: async () => [],
        findById: async (id) => this.vehicles.get(id) ?? null,
        findByIds: async (ids) =>
            ids
                .map((id) => this.vehicles.get(id))
                .filter((v): v is Vehicle => Boolean(v)),
        update: async () => null,
        delete: async () => true,
    };

    appRepo: IMechanicApplicationRepository = {
        create: async (a) => a,
        findById: async (id) => this.apps.get(id) ?? null,
        findByUserId: async (uid) =>
            Array.from(this.apps.values()).find((a) => a.userId === uid) ?? null,
        update: async () => null,
        updateServiceLocation: async () => null,
        findByStatus: async () => [],
        findByUserIds: async (uids) =>
            Array.from(this.apps.values()).filter((a) => uids.includes(a.userId)),
    };

    availabilityRepo: IMechanicAvailabilityRepository = {
        upsert: async (mechanicId, isAvailable, latitude, longitude) => {
            const avail = new MechanicAvailability(
                mechanicId,
                isAvailable,
                latitude,
                longitude,
                `avail_${mechanicId}`,
                new Date()
            );
            this.availabilities.set(mechanicId, avail);
            return avail;
        },
        findByMechanicId: async (mechanicId) =>
            this.availabilities.get(mechanicId) ?? null,
        findNearbyAvailableMechanics: async (lat, lng, radiusKm) => {
            return Array.from(this.availabilities.values()).filter((a) => {
                if (!a.isAvailable) return false;
                return calculateDistanceKm(lat, lng, a.latitude, a.longitude) <= radiusKm;
            });
        },
    };

    categoryRepo: IMechanicCategoryRepository = {
        create: async (c) => c,
        findById: async () => null,
        findBySlug: async () => null,
        findAll: async () => this.categories,
        update: async () => null,
        updateStatus: async () => null,
    };

    bookingRepo: IBookingRepository = {
        create: async () => {
            throw new Error("not used");
        },
        findById: async () => null,
        findByIdAndUserId: async () => null,
        findByUserId: async () => [],
        countByUserId: async () => 0,
        findByMechanicId: async () => [],
        findMechanicBookings: async () => ({ bookings: [], total: 0 }),
        getMechanicBookingCounts: async () => ({
            total: 0,
            today: 0,
            upcoming: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
        }),
        findInProgressMechanicIds: async (ids) =>
            new Set(ids.filter((id) => this.busyBookingMechanicIds.has(id))),
        findConflictingBooking: async () => null,
        findConflictingMechanicIds: async () => new Set<string>(),
        findActiveScheduledBookingsByMechanic: async () => [],
        updateStatus: async () => null,
        attachPaymentId: async () => null,
        expireStaleReservations: async () => 0,
    };

    emergencyRepo: IEmergencyRequestRepository = {
        create: async (req) => {
            const id = this.nextId("em_req");
            const created = new EmergencyRequest(
                req.userId,
                req.vehicleId,
                req.location,
                req.emergencyIssueCategory,
                req.issueTitle,
                req.issueDescription,
                req.issueImages,
                req.status,
                req.assignedMechanicId,
                [...req.rejectedByMechanicIds],
                id,
                new Date(),
                new Date()
            );
            this.requests.set(id, created);
            return created;
        },
        findById: async (id) => this.requests.get(id) ?? null,
        findByUserId: async (uid) =>
            Array.from(this.requests.values()).filter((r) => r.userId === uid),
        findActiveByUserId: async (uid) =>
            Array.from(this.requests.values()).find(
                (r) =>
                    r.userId === uid &&
                    ["pending", "searching", "assigned", "on_the_way", "arrived"].includes(
                        r.status
                    )
            ) ?? null,
        findNearbyPending: async (lat, lng, radiusKm, excludeMechanicId) =>
            Array.from(this.requests.values()).filter((r) => {
                if (!["pending", "searching"].includes(r.status)) return false;
                if (r.assignedMechanicId !== null) return false;
                if (r.rejectedByMechanicIds.includes(excludeMechanicId)) return false;
                return (
                    calculateDistanceKm(lat, lng, r.location.latitude, r.location.longitude) <=
                    radiusKm
                );
            }),
        atomicAccept: async (requestId, mechanicId) => {
            const req = this.requests.get(requestId);
            if (
                !req ||
                !["pending", "searching"].includes(req.status) ||
                req.assignedMechanicId !== null
            ) {
                return null;
            }
            req.status = "assigned";
            req.assignedMechanicId = mechanicId;
            req.acceptedAt = new Date();
            req.updatedAt = new Date();
            return req;
        },
        addRejection: async (requestId, mechanicId) => {
            const req = this.requests.get(requestId);
            if (!req) return null;
            if (!req.rejectedByMechanicIds.includes(mechanicId)) {
                req.rejectedByMechanicIds.push(mechanicId);
            }
            return req;
        },
        findByIdPopulated: async (requestId) => {
            const req = this.requests.get(requestId);
            if (!req) return null;
            const mech = req.assignedMechanicId
                ? this.users.get(req.assignedMechanicId)
                : null;
            return {
                request: req,
                mechanicDetails: mech
                    ? {
                          fullName: mech.fullName,
                          email: mech.email,
                          phoneNumber: mech.phoneNumber,
                      }
                    : null,
            };
        },
        findByIdWithCustomerDetails: async (requestId) => {
            const req = this.requests.get(requestId);
            if (!req) return null;
            const cust = this.users.get(req.userId);
            return {
                request: req,
                customerDetails: cust
                    ? {
                          fullName: cust.fullName,
                          email: cust.email,
                          phoneNumber: cust.phoneNumber,
                      }
                    : null,
            };
        },
        findByAssignedMechanicId: async (mechanicId) =>
            Array.from(this.requests.values()).filter(
                (r) =>
                    r.assignedMechanicId === mechanicId &&
                    ["assigned", "on_the_way", "arrived", "completed"].includes(
                        r.status
                    )
            ),
        findActiveAssignedMechanicIds: async (mechanicIds, excludeRequestId) => {
            const active = new Set<string>();
            for (const req of this.requests.values()) {
                if (
                    excludeRequestId &&
                    req.id === excludeRequestId
                ) {
                    continue;
                }
                if (
                    req.assignedMechanicId &&
                    mechanicIds.includes(req.assignedMechanicId) &&
                    ["assigned", "on_the_way", "arrived"].includes(req.status)
                ) {
                    active.add(req.assignedMechanicId);
                }
            }
            return active;
        },
        updateAssignedRequestStatus: async (
            requestId,
            mechanicId,
            currentStatus: EmergencyRequestStatus,
            newStatus: EmergencyRequestStatus,
            timestamps
        ) => {
            const req = this.requests.get(requestId);
            if (
                !req ||
                req.assignedMechanicId !== mechanicId ||
                req.status !== currentStatus
            ) {
                return null;
            }
            req.status = newStatus;
            if (timestamps?.acceptedAt) req.acceptedAt = timestamps.acceptedAt;
            if (timestamps?.travelStartedAt)
                req.travelStartedAt = timestamps.travelStartedAt;
            if (timestamps?.arrivedAt) req.arrivedAt = timestamps.arrivedAt;
            if (timestamps?.completedAt) req.completedAt = timestamps.completedAt;
            req.updatedAt = new Date();
            return req;
        },
        cancelByCustomer: async (requestId, userId, reason) => {
            const req = this.requests.get(requestId);
            if (
                !req ||
                req.userId !== userId ||
                ["completed", "cancelled"].includes(req.status)
            ) {
                return null;
            }
            req.status = "cancelled";
            req.cancelledAt = new Date();
            if (reason) req.cancellationReason = reason;
            return req;
        },
    };

    inspectionRepo: IEmergencyInspectionRepository = {
        create: async (inspection) => {
            const id = this.nextId("insp");
            const created = new EmergencyInspection({
                ...inspection.toObject(),
                id,
            });
            this.inspections.set(inspection.emergencyRequestId, created);
            return created;
        },
        findByEmergencyRequestId: async (reqId) =>
            this.inspections.get(reqId) ?? null,
        updateWithStatusGuard: async (
            reqId,
            mechanicId,
            expectedStatuses: EmergencyInspectionStatus[],
            updates: Partial<EmergencyInspectionProps>
        ) => {
            const existing = this.inspections.get(reqId);
            if (
                !existing ||
                existing.mechanicId !== mechanicId ||
                !expectedStatuses.includes(existing.status)
            ) {
                return null;
            }
            const next = new EmergencyInspection({
                ...existing.toObject(),
                ...updates,
            });
            this.inspections.set(reqId, next);
            return next;
        },
    };

    estimateRepo: IEmergencyEstimateRepository = {
        create: async (estimate) => {
            const id = this.nextId("est");
            const created = new EmergencyEstimate({
                ...estimate.toObject(),
                id,
            });
            this.estimates.set(id, created);
            return created;
        },
        findById: async (id) => this.estimates.get(id) ?? null,
        findAllByEmergencyRequestId: async (reqId) =>
            Array.from(this.estimates.values())
                .filter((e) => e.emergencyRequestId === reqId)
                .sort((a, b) => b.revision - a.revision),
        findLatestByEmergencyRequestId: async (reqId) =>
            Array.from(this.estimates.values())
                .filter((e) => e.emergencyRequestId === reqId)
                .sort((a, b) => b.revision - a.revision)[0] ?? null,
        updateStatusWithGuard: async (
            estimateId,
            expectedStatuses: EmergencyEstimateStatus[],
            nextStatus: EmergencyEstimateStatus,
            updates: Partial<EmergencyEstimateProps> = {}
        ) => {
            const existing = this.estimates.get(estimateId);
            if (!existing || !expectedStatuses.includes(existing.status)) {
                return null;
            }
            const next = new EmergencyEstimate({
                ...existing.toObject(),
                ...updates,
                status: nextStatus,
            });
            this.estimates.set(estimateId, next);
            return next;
        },
        markRejectedRevisionsSuperseded: async (reqId) => {
            let count = 0;
            for (const [id, est] of this.estimates.entries()) {
                if (est.emergencyRequestId === reqId && est.status === "rejected") {
                    this.estimates.set(
                        id,
                        new EmergencyEstimate({
                            ...est.toObject(),
                            status: "revised",
                        })
                    );
                    count += 1;
                }
            }
            return count;
        },
    };

    paymentRepo: IEmergencyPaymentRepository = {
        create: async (payment) => {
            const id = this.nextId("em_pay");
            const created = new EmergencyPayment({
                ...payment.toObject(),
                id,
            });
            this.payments.set(id, created);
            return created;
        },
        findById: async (id) => this.payments.get(id) ?? null,
        findLatestByEmergencyRequestId: async (reqId) =>
            Array.from(this.payments.values())
                .filter((p) => p.emergencyRequestId === reqId)
                .pop() ?? null,
        findLatestByEstimateId: async (estId) =>
            Array.from(this.payments.values())
                .filter((p) => p.estimateId === estId)
                .pop() ?? null,
        findByRazorpayOrderId: async (orderId) =>
            Array.from(this.payments.values()).find(
                (p) => p.razorpayOrderId === orderId
            ) ?? null,
        findByRazorpayPaymentId: async (razorpayPaymentId) =>
            Array.from(this.payments.values()).find(
                (p) => p.razorpayPaymentId === razorpayPaymentId
            ) ?? null,
        updateStatusWithGuard: async (
            paymentId,
            expectedStatuses: EmergencyPaymentStatus[],
            nextStatus: EmergencyPaymentStatus,
            updates: Partial<EmergencyPaymentProps> = {}
        ) => {
            const existing = this.payments.get(paymentId);
            if (!existing || !expectedStatuses.includes(existing.status)) {
                return null;
            }
            const next = new EmergencyPayment({
                ...existing.toObject(),
                ...updates,
                status: nextStatus,
            });
            this.payments.set(paymentId, next);
            return next;
        },
    };

    repairRepo: IEmergencyRepairRepository = {
        create: async (repair) => {
            const id = this.nextId("rep");
            const created = new EmergencyRepair({
                ...repair.toObject(),
                id,
            });
            this.repairs.set(repair.emergencyRequestId, created);
            return created;
        },
        findByEmergencyRequestId: async (reqId) =>
            this.repairs.get(reqId) ?? null,
        appendProgressLog: async (reqId, mechanicId, log: RepairProgressLog) => {
            const existing = this.repairs.get(reqId);
            if (
                !existing ||
                existing.mechanicId !== mechanicId ||
                existing.status !== "in_progress"
            ) {
                return null;
            }
            const next = new EmergencyRepair({
                ...existing.toObject(),
                progressLogs: [...existing.progressLogs, log],
            });
            this.repairs.set(reqId, next);
            return next;
        },
        updateStatusWithGuard: async (
            reqId,
            mechanicId,
            expectedStatuses: EmergencyRepairStatus[],
            nextStatus: EmergencyRepairStatus,
            updates: Partial<EmergencyRepairProps> = {}
        ) => {
            const existing = this.repairs.get(reqId);
            if (
                !existing ||
                existing.mechanicId !== mechanicId ||
                !expectedStatuses.includes(existing.status)
            ) {
                return null;
            }
            const next = new EmergencyRepair({
                ...existing.toObject(),
                ...updates,
                status: nextStatus,
            });
            this.repairs.set(reqId, next);
            return next;
        },
    };
}

function seedFixtureData(repo: InMemoryEmergencyRepositories) {
    // Customer at Trivandrum Technopark (8.5568, 76.8816)
    const customer = new User(
        "Arjun Nair",
        "arjun@example.com",
        "+919876543210",
        "hash",
        ["user"],
        "user_cust_1",
        undefined,
        "LOCAL",
        "active",
        "user"
    );
    repo.users.set(customer.userId!, customer);

    const vehicle = new Vehicle(
        "user_cust_1",
        "KL01CD4455",
        "car",
        "Hyundai",
        "i20",
        2022,
        "petrol",
        "Silver",
        undefined,
        undefined,
        undefined,
        "veh_car_1"
    );
    repo.vehicles.set(vehicle.id!, vehicle);

    const engineCat = new MechanicCategory({
        id: "cat_engine",
        name: "Engine & Battery",
        slug: "engine-battery",
        description: "Roadside engine and electrical support",
        subcategories: [
            { id: "sub_bat", name: "Battery", slug: "battery", isActive: true },
            { id: "sub_jump", name: "Jumpstart", slug: "jumpstart", isActive: true },
            { id: "sub_eng", name: "Engine Repair", slug: "engine-repair", isActive: true },
        ],
        isActive: true,
    });
    repo.categories.push(engineCat);

    const makeMechanic = (
        id: string,
        name: string,
        lat: number,
        lng: number,
        opts?: {
            status?: "active" | "blocked";
            appStatus?: "approved" | "pending";
            services?: string[];
            vehicleTypes?: ("car" | "bike" | "auto" | "ev")[];
            isAvailable?: boolean;
            updatedAt?: Date;
        }
    ) => {
        const user = new User(
            name,
            `${id}@example.com`,
            "+919900112233",
            "hash",
            ["mechanic"],
            id,
            undefined,
            "LOCAL",
            opts?.status ?? "active",
            "mechanic"
        );
        repo.users.set(id, user);

        const app = new MechanicApplication({
            id: `app_${id}`,
            userId: id,
            serviceModel: "both",
            serviceAddress: "Sreekaryam",
            latitude: 8.545,
            longitude: 76.91,
            serviceRadiusKm: 20,
            experienceYears: 6,
            serviceOffered: opts?.services ?? ["Engine Repair", "Battery"],
            supportedVehicleTypes: opts?.vehicleTypes ?? ["car", "bike"],
            workshopName: `${name} Auto Works`,
            status: opts?.appStatus ?? "approved",
        });
        repo.apps.set(app.id!, app);

        repo.availabilities.set(
            id,
            new MechanicAvailability(
                id,
                opts?.isAvailable ?? true,
                lat,
                lng,
                `avail_${id}`,
                opts?.updatedAt ?? new Date()
            )
        );
    };

    // Mechanic 1: 2.2 km away, approved, active, car+engine/battery
    makeMechanic("mech_near_valid", "Suresh Kumar", 8.565, 76.90);

    // Mechanic 2: ~7.1 km away (outside 5 km, inside 10 km fallback)
    makeMechanic("mech_fallback_valid", "Manoj Pillai", 8.51, 76.925);

    // Mechanic 3: 1.5 km away, stale GPS update (2 hours old > 60m)
    makeMechanic("mech_stale", "Stale Mech", 8.56, 76.89, {
        updatedAt: new Date(Date.now() - 120 * 60 * 1000),
    });

    // Mechanic 4: 1.5 km away, only bike supported
    makeMechanic("mech_bike_only", "Bike Only Mech", 8.56, 76.89, {
        vehicleTypes: ["bike"],
    });

    // Mechanic 5: 1.5 km away, unapproved application
    makeMechanic("mech_unapproved", "Pending Mech", 8.56, 76.89, {
        appStatus: "pending",
    });

    // Mechanic 6: 1.5 km away, busy in scheduled booking
    makeMechanic("mech_busy_booking", "Busy Scheduled Mech", 8.56, 76.89);
    repo.busyBookingMechanicIds.add("mech_busy_booking");

    return { customer, vehicle };
}

test("Emergency discovery enforces 7 eligibility rules & falls back from 5 km to 10 km cleanly", async () => {
    const repo = new InMemoryEmergencyRepositories();
    seedFixtureData(repo);
    const notif = new RecordingNotificationService();

    const createUseCase = new CreateEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.vehicleRepo,
        new CreateEmerencyRequestValidator(),
        repo.availabilityRepo,
        notif,
        repo.userRepo,
        repo.appRepo,
        repo.categoryRepo,
        repo.bookingRepo
    );

    const created = await createUseCase.execute(
        "user_cust_1",
        {
            vehicleId: "veh_car_1",
            location: {
                latitude: 8.5568,
                longitude: 76.8816,
                address: "Technopark Phase 1, Thiruvananthapuram",
            },
            emergencyIssueCategory: "battery",
            issueTitle: "Car battery completely dead",
            issueDescription: "Starter clicking but engine will not crank.",
            issueImages: ["https://cdn.test/img1.jpg"],
        }
    );

    assert.equal(created.status, "searching");
    assert.equal(created.discoverySummary?.matchedMechanicsCount, 1);
    assert.equal(created.discoverySummary?.searchRadiusKm, 5);
    assert.equal(created.discoverySummary?.fallbackUsed, false);
    assert.deepEqual(
        notif.newRequestEvents.map((e) => e.mechanicId),
        ["mech_near_valid"]
    );
    assert.ok(typeof notif.newRequestEvents[0]?.distanceKm === "number");
    assert.equal(notif.newRequestEvents[0]?.vehicleSummary?.brand, "Hyundai");

    // Now move primary mechanic offline and create another request (after cancelling first) -> triggers 10 km fallback
    const cancelUseCase = new CancelEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.repairRepo
    );
    await cancelUseCase.execute(created.id!, "user_cust_1", "Testing fallback");

    repo.availabilities.get("mech_near_valid")!.isAvailable = false;
    notif.newRequestEvents = [];

    const fallbackCreated = await createUseCase.execute(
        "user_cust_1",
        {
            vehicleId: "veh_car_1",
            location: { latitude: 8.5568, longitude: 76.8816 },
            emergencyIssueCategory: "battery",
            issueTitle: "Dead battery fallback",
            issueDescription: "Testing 10 km expansion when 0 within 5 km.",
            issueImages: [],
        }
    );

    assert.equal(fallbackCreated.discoverySummary?.matchedMechanicsCount, 1);
    assert.equal(fallbackCreated.discoverySummary?.searchRadiusKm, 10);
    assert.equal(fallbackCreated.discoverySummary?.fallbackUsed, true);
    assert.deepEqual(
        notif.newRequestEvents.map((e) => e.mechanicId),
        ["mech_fallback_valid"]
    );

    // GetNearbyEmergencyRequestsUseCase throws explicit STALE_MECHANIC_LOCATION for stale GPS mechanic
    const nearbyUseCase = new GetNearbyEmergencyRequestsUseCase(
        repo.emergencyRepo,
        repo.availabilityRepo,
        repo.userRepo,
        repo.appRepo,
        repo.vehicleRepo,
        repo.categoryRepo,
        repo.bookingRepo
    );

    await assert.rejects(
        () => nearbyUseCase.execute("mech_stale"),
        (err: Error & { code?: string }) =>
            err.code === "STALE_MECHANIC_LOCATION"
    );

    // Fallback mechanic sees request with distanceKm and vehicleSummary populated
    const fallbackList = await nearbyUseCase.execute("mech_fallback_valid");
    assert.equal(fallbackList.length, 1);
    assert.equal(fallbackList[0]?.vehicleSummary?.registrationNumber, "KL01CD4455");
});

test("Atomic accept race, WebRTC post-acceptance call signalling, and cancellation cleanup", async () => {
    const repo = new InMemoryEmergencyRepositories();
    seedFixtureData(repo);
    const notif = new RecordingNotificationService();
    const locationStore = new InMemoryLocationStore();

    const createUseCase = new CreateEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.vehicleRepo,
        new CreateEmerencyRequestValidator(),
        repo.availabilityRepo,
        notif,
        repo.userRepo,
        repo.appRepo,
        repo.categoryRepo,
        repo.bookingRepo
    );
    const req = await createUseCase.execute(
        "user_cust_1",
        {
            vehicleId: "veh_car_1",
            location: { latitude: 8.5568, longitude: 76.8816 },
            emergencyIssueCategory: "engine",
            issueTitle: "Engine stalled suddenly",
            issueDescription: "Engine stopped near main gate.",
            issueImages: [],
        }
    );

    // WebRTC socket handler setup
    const roomEmits: Array<{ rooms: string[]; event: string; payload: unknown }> = [];
    const makeEmitter = (rooms: string[]) => ({
        to(room: string) {
            return makeEmitter([...rooms, room]);
        },
        emit(event: string, payload: unknown) {
            roomEmits.push({ rooms, event, payload });
        },
    });
    const fakeIo = {
        to(room: string) {
            return makeEmitter([room]);
        },
    } as unknown as import("socket.io").Server;

    const callHandler = new EmergencyCallSocketHandler(
        fakeIo,
        repo.emergencyRepo,
        repo.userRepo
    );

    const makeFakeSocket = (userId: string, activeRole: string) => {
        const ee = new EventEmitter();
        const emitted: Array<{ event: string; payload: unknown }> = [];
        return {
            socket: {
                data: { userId, activeRole },
                on: ee.on.bind(ee),
                off: ee.off.bind(ee),
                emit(event: string, payload: unknown) {
                    emitted.push({ event, payload });
                    return true;
                },
            } as unknown as import("socket.io").Socket,
            trigger: (event: string, payload: unknown) => ee.emit(event, payload),
            emitted,
        };
    };

    const mechSock = makeFakeSocket("mech_near_valid", "mechanic");
    const custSock = makeFakeSocket("user_cust_1", "user");
    callHandler.register(mechSock.socket);
    callHandler.register(custSock.socket);

    // 1. Pre-acceptance video call is blocked
    await new Promise<void>((resolve) => {
        mechSock.trigger("call:request", { requestId: req.id });
        setTimeout(resolve, 10);
    });
    assert.equal(mechSock.emitted.at(-1)?.event, "call:error");

    // 2. Concurrent accept: first succeeds, second fails with ConflictError
    const acceptUseCase = new AcceptEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.userRepo,
        repo.appRepo,
        repo.availabilityRepo,
        repo.vehicleRepo,
        repo.categoryRepo,
        repo.bookingRepo,
        notif
    );

    const accepted = await acceptUseCase.execute(req.id!, "mech_near_valid");
    assert.equal(accepted.status, "assigned");
    assert.equal(accepted.assignedMechanicId, "mech_near_valid");
    assert.equal(notif.requestTakenEvents.length, 1);

    await assert.rejects(
        () => acceptUseCase.execute(req.id!, "mech_fallback_valid"),
        /already been assigned/
    );

    // 3. Post-acceptance call signalling full lifecycle
    await new Promise<void>((resolve) => {
        mechSock.trigger("call:request", { requestId: req.id });
        setTimeout(resolve, 10);
    });
    const ringing = mechSock.emitted.find((e) => e.event === "call:ringing")
        ?.payload as { callId: string };
    const incoming = roomEmits.find(
        (e) =>
            e.rooms.includes("user:user_cust_1") &&
            e.event === "call:incoming"
    )?.payload as {
        callId: string;
        caller: { mechanicId: string; fullName: string };
    };

    assert.ok(ringing?.callId);
    assert.equal(incoming?.callId, ringing.callId);
    assert.equal(incoming?.caller?.fullName, "Suresh Kumar");

    await new Promise<void>((resolve) => {
        custSock.trigger("call:accept", {
            requestId: req.id,
            callId: ringing.callId,
        });
        setTimeout(resolve, 10);
    });
    await new Promise<void>((resolve) => {
        custSock.trigger("call:end", {
            requestId: req.id,
            callId: ringing.callId,
        });
        setTimeout(resolve, 10);
    });
    assert.ok(
        roomEmits.some(
            (e) =>
                e.rooms.includes("mechanic:mech_near_valid") &&
                e.event === "call:accept"
        )
    );
    assert.ok(
        roomEmits.some((e) => e.event === "call:end")
    );

    // 4. Customer cancellation cleans up Redis location & notifies assigned mechanic
    await locationStore.save({
        requestId: req.id!,
        mechanicId: "mech_near_valid",
        latitude: 8.56,
        longitude: 76.89,
        accuracy: 10,
        heading: null,
        speed: null,
        updatedAt: new Date().toISOString(),
    });
    const cancelUseCase = new CancelEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.repairRepo,
        locationStore,
        notif
    );
    const cancelled = await cancelUseCase.execute(
        req.id!,
        "user_cust_1",
        "Found local help"
    );
    assert.equal(cancelled.status, "cancelled");
    assert.equal(cancelled.cancellationReason, "Found local help");
    assert.ok(locationStore.deletedIds.includes(req.id!));
    assert.ok(
        notif.mechanicUpdates.some(
            (m) =>
                m.mechanicId === "mech_near_valid" &&
                m.eventName === "emergency_request_cancelled"
        )
    );
});

test("End-to-end Inspection -> Estimate Reject & Revision -> Combined Razorpay Payment & Webhook -> Repair -> Service Report", async () => {
    const repo = new InMemoryEmergencyRepositories();
    seedFixtureData(repo);
    const txManager = new FakeTransactionManager();
    const gateway = new MockPaymentGateway();
    const locationStore = new InMemoryLocationStore();
    const notif = new RecordingNotificationService();

    const createUseCase = new CreateEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.vehicleRepo,
        new CreateEmerencyRequestValidator(),
        repo.availabilityRepo,
        notif,
        repo.userRepo,
        repo.appRepo,
        repo.categoryRepo,
        repo.bookingRepo
    );
    const acceptUseCase = new AcceptEmergencyRequestUseCase(
        repo.emergencyRepo,
        repo.userRepo,
        repo.appRepo,
        repo.availabilityRepo,
        repo.vehicleRepo,
        repo.categoryRepo,
        repo.bookingRepo,
        notif
    );
    const startTravelUseCase = new StartEmergencyTravelUseCase(
        repo.emergencyRepo,
        notif
    );
    const updateLocUseCase = new UpdateMechanicLiveLocationUseCase(
        repo.emergencyRepo,
        locationStore
    );
    const joinTrackingUseCase = new JoinEmergencyTrackingUseCase(
        repo.emergencyRepo
    );
    const confirmArrivalUseCase = new ConfirmArrivalUseCase(
        repo.emergencyRepo,
        notif
    );
    const startInspectionUseCase = new StartEmergencyInspectionUseCase(
        repo.emergencyRepo,
        repo.inspectionRepo,
        notif
    );
    const completeInspectionUseCase = new CompleteEmergencyInspectionUseCase(
        repo.emergencyRepo,
        repo.inspectionRepo,
        notif
    );
    const submitEstimateUseCase = new SubmitEmergencyEstimateUseCase(
        repo.emergencyRepo,
        repo.inspectionRepo,
        repo.estimateRepo,
        txManager,
        notif
    );
    const rejectEstimateUseCase = new RejectEmergencyEstimateUseCase(
        repo.emergencyRepo,
        repo.estimateRepo,
        notif
    );
    const approveEstimateUseCase = new ApproveEmergencyEstimateUseCase(
        repo.emergencyRepo,
        repo.estimateRepo,
        notif
    );
    const settlementHelper = new EmergencyPaymentSettlementHelper(
        repo.emergencyRepo,
        repo.estimateRepo,
        repo.paymentRepo,
        txManager,
        notif
    );
    const createPaymentOrderUseCase = new CreateEmergencyPaymentOrderUseCase(
        repo.emergencyRepo,
        repo.estimateRepo,
        repo.paymentRepo,
        gateway
    );
    const verifyPaymentUseCase = new VerifyEmergencyPaymentUseCase(
        repo.emergencyRepo,
        repo.paymentRepo,
        gateway,
        settlementHelper
    );
    const startRepairUseCase = new StartEmergencyRepairUseCase(
        repo.emergencyRepo,
        repo.inspectionRepo,
        repo.estimateRepo,
        repo.paymentRepo,
        repo.repairRepo,
        notif
    );
    const logProgressUseCase = new UpdateEmergencyRepairProgressUseCase(
        repo.emergencyRepo,
        repo.repairRepo,
        notif
    );
    const completeRepairUseCase = new CompleteEmergencyRepairUseCase(
        repo.emergencyRepo,
        repo.repairRepo,
        txManager,
        locationStore,
        notif
    );
    const reportUseCase = new GetEmergencyServiceReportUseCase(
        repo.emergencyRepo,
        repo.userRepo,
        repo.vehicleRepo,
        repo.appRepo,
        repo.inspectionRepo,
        repo.estimateRepo,
        repo.paymentRepo,
        repo.repairRepo
    );

    const req = await createUseCase.execute(
        "user_cust_1",
        {
            vehicleId: "veh_car_1",
            location: {
                latitude: 8.5568,
                longitude: 76.8816,
                address: "Technopark Phase 1",
            },
            emergencyIssueCategory: "battery",
            issueTitle: "Battery discharge emergency",
            issueDescription: "Need jumpstart and alternator check.",
            issueImages: [],
        }
    );

    await acceptUseCase.execute(req.id!, "mech_near_valid");
    await startTravelUseCase.execute(req.id!, "mech_near_valid");

    // Live location update & tracking join validation
    const savedLoc = await updateLocUseCase.execute("mech_near_valid", {
        requestId: req.id!,
        latitude: 8.56,
        longitude: 76.89,
        accuracy: 8,
        heading: null,
        speed: null,
    });
    assert.equal(savedLoc.mechanicId, "mech_near_valid");
    await joinTrackingUseCase.execute(req.id!, "user_cust_1");

    // Inspection cannot start before arrival
    await assert.rejects(
        () => startInspectionUseCase.execute(req.id!, "mech_near_valid"),
        (err: Error & { code?: string }) => err.code === "ARRIVAL_REQUIRED"
    );

    await confirmArrivalUseCase.execute(req.id!, "mech_near_valid");
    await startInspectionUseCase.execute(req.id!, "mech_near_valid");

    await completeInspectionUseCase.execute(req.id!, "mech_near_valid", {
        vehicleConditionSummary: "Battery sulfated and clamp loose",
        findings: [
            {
                component: "12V Battery",
                issue: "Voltage dropped to 9.4V under load",
                severity: "high",
                recommendedAction: "Replace battery clamp & jumpstart",
            },
        ],
        requiredRepairs: ["Clean terminal", "Replace clamp", "Jumpstart"],
    });

    // Submit Revision 1 -> server calculates total = 250 + 700 + 350 = 1300
    const rev1 = await submitEstimateUseCase.execute(
        req.id!,
        "mech_near_valid",
        {
            inspectionCharge: 250,
            items: [
                {
                    category: "part",
                    description: "Heavy-duty brass battery clamp",
                    quantity: 2,
                    unitPrice: 350,
                },
                {
                    category: "labour",
                    description: "Terminal replacement & jumpstart",
                    quantity: 1,
                    unitPrice: 350,
                },
            ],
            estimatedCompletionMinutes: 35,
        }
    );
    assert.equal(rev1.revision, 1);
    assert.equal(rev1.partsTotal, 700);
    assert.equal(rev1.labourTotal, 350);
    assert.equal(rev1.totalAmount, 1300);

    // Customer rejects Revision 1 -> blocks repair
    const rejectedRev1 = await rejectEstimateUseCase.execute(
        req.id!,
        rev1.id!,
        "user_cust_1",
        { reason: "Only need 1 clamp replaced" }
    );
    assert.equal(rejectedRev1.status, "rejected");

    // Mechanic submits Revision 2 -> total = 250 + 350 + 350 + 100 = 1050; Revision 1 marked 'revised'
    const rev2 = await submitEstimateUseCase.execute(
        req.id!,
        "mech_near_valid",
        {
            inspectionCharge: 250,
            items: [
                {
                    category: "part",
                    description: "Heavy-duty brass battery clamp",
                    quantity: 1,
                    unitPrice: 350,
                },
                {
                    category: "labour",
                    description: "Terminal replacement & jumpstart",
                    quantity: 1,
                    unitPrice: 350,
                },
                {
                    category: "additional",
                    description: "Anti-corrosion terminal spray",
                    quantity: 1,
                    unitPrice: 100,
                },
            ],
        }
    );
    assert.equal(rev2.revision, 2);
    assert.equal(rev2.totalAmount, 1050);
    assert.equal(
        (await repo.estimateRepo.findById(rev1.id!))?.status,
        "revised"
    );

    // Approve Revision 2
    const approved = await approveEstimateUseCase.execute(
        req.id!,
        rev2.id!,
        "user_cust_1"
    );
    assert.equal(approved.status, "approved");

    // Repair cannot start BEFORE payment verification
    await assert.rejects(
        () => startRepairUseCase.execute(req.id!, "mech_near_valid"),
        (err: Error & { code?: string }) =>
            err.code === "PAYMENT_REQUIRED_BEFORE_REPAIR"
    );

    // Razorpay payment order + verification (1050 INR = 105000 paise)
    const order = await createPaymentOrderUseCase.execute(req.id!, "user_cust_1");
    assert.equal(order.amount, 1050);
    assert.equal(order.amountPaise, 105000);

    const paymentId = `pay_for_${order.razorpayOrderId}`;
    gateway.capturedAmounts.set(paymentId, 105000);

    const verified = await verifyPaymentUseCase.execute(req.id!, "user_cust_1", {
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: `valid_sig_${order.razorpayOrderId}_${paymentId}`,
    });
    assert.equal(verified.paymentStatus, "paid");
    assert.equal(verified.estimateStatus, "paid");

    // Duplicate webhook capture is idempotent
    const webhookUseCase = new HandlePaymentWebhookUseCase(
        repo.bookingRepo,
        {
            create: async () => {
                throw new Error("unused");
            },
            findById: async () => null,
            findByBookingId: async () => null,
            findLatestByBookingId: async () => null,
            findLatestByBookingIds: async () => new Map(),
            findByRazorpayOrderId: async () => null,
            findByRazorpayPaymentId: async () => null,
            findByIdempotencyKey: async () => null,
            updateStatus: async () => null,
            createAllocation: async () => {
                throw new Error("unused");
            },
            findAllocationByBookingId: async () => null,
            findAllocationByPaymentId: async () => null,
        } satisfies IPaymentRepository,
        gateway,
        new PaymentSettlementHelper(
            repo.bookingRepo,
            {} as IPaymentRepository,
            {} as never,
            txManager
        ),
        repo.paymentRepo,
        settlementHelper
    );

    const webhookBody = JSON.stringify({
        event: "payment.captured",
        payload: {
            payment: {
                entity: {
                    id: paymentId,
                    order_id: order.razorpayOrderId,
                    amount: 105000,
                    currency: "INR",
                    status: "captured",
                },
            },
        },
    });
    const webhookSig = crypto
        .createHmac("sha256", WEBHOOK_SECRET)
        .update(webhookBody)
        .digest("hex");

    const webhookResult = await webhookUseCase.execute(
        webhookBody,
        webhookSig,
        JSON.parse(webhookBody)
    );
    assert.equal(webhookResult.processed, true);

    // Start repair -> log progress -> complete repair
    await startRepairUseCase.execute(req.id!, "mech_near_valid");
    await logProgressUseCase.execute(req.id!, "mech_near_valid", {
        note: "Replaced corroded clamp and applied terminal coating.",
    });
    const completion = await completeRepairUseCase.execute(
        req.id!,
        "mech_near_valid",
        {
            workPerformed: "Clamp replaced, battery jumpstarted, charging verified at 14.1V.",
            partsUsed: [{ name: "Brass Battery Clamp", quantity: 1 }],
        }
    );

    assert.equal(completion.request.status, "completed");
    assert.equal(completion.repair.status, "completed");
    assert.ok(locationStore.deletedIds.includes(req.id!));

    // Customer & Mechanic both can load full Service Report / Invoice
    const report = await reportUseCase.execute(req.id!, "user_cust_1");
    assert.equal(report.emergencyRequestId, req.id);
    assert.equal(report.customer.fullName, "Arjun Nair");
    assert.equal(report.mechanic.fullName, "Suresh Kumar");
    assert.equal(report.mechanic.workshopName, "Suresh Kumar Auto Works");
    assert.equal(report.vehicle.registrationNumber, "KL01CD4455");
    assert.equal(report.approvedEstimate.revision, 2);
    assert.equal(report.estimateHistoryCount, 2);
    assert.equal(report.payment.amount, 1050);
    assert.equal(report.repair.partsUsed.length, 1);
});
