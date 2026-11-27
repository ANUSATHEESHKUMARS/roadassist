import type { MechanicServiceModel } from "@/types/mechanic/common";
import type { Vehicle } from "@/types/user/vehicle";

export type BookingType = "emergency" | "scheduled";

export type BookingSlot = "morning" | "afternoon" | "full_day";

export type BookingStatus =
    | "pending"
    | "pending_payment"
    | "accepted"
    | "rejected"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "expired";

export type PaymentStatus =
    | "created"
    | "pending"
    | "paid"
    | "failed"
    | "refund_requested"
    | "refund_pending"
    | "refunded";

export type AllocationStatus = "pending" | "allocated" | "reversed";

export type BookingStep =
    | "vehicle"
    | "service"
    | "location"
    | "schedule"
    | "mechanics"
    | "payment"
    | "confirmation";

export const BOOKING_STEPS: { id: BookingStep; label: string }[] = [
    { id: "vehicle", label: "Vehicle" },
    { id: "service", label: "Service" },
    { id: "location", label: "Location" },
    { id: "schedule", label: "Date & Shift" },
    { id: "mechanics", label: "Mechanic" },
    { id: "payment", label: "Payment" },
    { id: "confirmation", label: "Confirmed" },
];

export type PaymentPhase =
    | "idle"
    | "creating_order"
    | "checkout_open"
    | "verifying"
    | "pending_recovery"
    | "confirmed"
    | "failed"
    | "cancelled";

export interface BookingCommonResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface BookingLocation {
    latitude: number;
    longitude: number;
    address: string;
}

export interface DiscoverMechanicsPayload {
    scheduledDate: string;
    slot: BookingSlot;
    vehicleId: string;
    serviceType: string;
    latitude: number;
    longitude: number;
}

export interface DiscoveredMechanicItem {
    mechanicId: string;
    fullName: string;
    serviceModel?: MechanicServiceModel;
    serviceAddress?: string;
    workshopName?: string;
    workshopAddress?: string;
    experienceYears?: number;
    distanceKm: number;
    serviceRadiusKm: number;
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
}

export interface DiscoverMechanicsResponse {
    scheduledDate: string;
    slot: BookingSlot;
    bookingAmount: number;
    currency: string;
    mechanics: DiscoveredMechanicItem[];
}

export interface CreateBookingReservationPayload {
    mechanicId: string;
    vehicleId: string;
    serviceType: string;
    serviceAddress: string;
    scheduledDate: string;
    slot: BookingSlot;
    latitude: number;
    longitude: number;
}

export interface CreateBookingReservationResponse {
    bookingId: string;
    status: BookingStatus;
    mechanicId: string;
    vehicleId: string;
    serviceType: string;
    serviceAddress: string;
    scheduledDate: string;
    slot: BookingSlot;
    bookingAmount: number;
    currency: string;
    reservationExpiresAt: string;
}

export interface CreatePaymentOrderResponse {
    bookingId: string;
    paymentId: string;
    razorpayOrderId: string;
    amount: number;
    amountPaise: number;
    currency: string;
    keyId: string;
    reservationExpiresAt?: string;
}

export interface VerifyPaymentPayload {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentAllocationSummary {
    id: string;
    totalAmount: number;
    superAdminShare: number;
    adminShare: number;
    mechanicShare: number;
    currency: string;
    status: AllocationStatus;
    allocatedAt?: string;
}

export interface VerifyPaymentResponse {
    bookingId: string;
    bookingStatus: BookingStatus;
    paymentId: string;
    paymentStatus: PaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    confirmedAt?: string;
    allocation: PaymentAllocationSummary;
}

export interface BookingStatusPaymentSummary {
    paymentId: string;
    status: PaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    failureReason?: string;
    paidAt?: string;
    refundedAt?: string;
}

export interface BookingStatusResponse {
    bookingId: string;
    status: BookingStatus;
    scheduledDate: string;
    slot: BookingSlot;
    bookingAmount: number;
    reservationExpiresAt?: string;
    confirmedAt?: string;
    expiredAt?: string;
    payment?: BookingStatusPaymentSummary;
}

export interface BookingDetailsPaymentSummary {
    paymentId: string;
    status: PaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    amount: number;
    currency: string;
    failureReason?: string;
    refundId?: string;
    paidAt?: string;
    refundedAt?: string;
}

export interface BookingVehicleSummary {
    vehicleId: string;
    brand: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
}

export interface BookingMechanicSummary {
    mechanicId: string;
    fullName: string;
    workshopName?: string;
    serviceModel?: MechanicServiceModel;
}

export type BookingHistoryCategory =
    | "all"
    | "upcoming"
    | "completed"
    | "cancelled";

export interface GetMyBookingsParams {
    page?: number;
    limit?: number;
    category?: BookingHistoryCategory;
}

export interface MyBookingItem {
    bookingId: string;
    bookingType: string;
    serviceType: string;
    serviceAddress: string;
    scheduledDate: string;
    slot: BookingSlot;
    bookingAmount: number;
    status: BookingStatus;
    paymentStatus?: PaymentStatus;
    reservationExpiresAt?: string;
    confirmedAt?: string;
    createdAt?: string;
    vehicle?: BookingVehicleSummary;
    mechanic?: BookingMechanicSummary;
}

export interface MyBookingsPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface MyBookingsCounts {
    all: number;
    upcoming: number;
    completed: number;
    cancelled: number;
}

export interface GetMyBookingsResponse {
    bookings: MyBookingItem[];
    pagination: MyBookingsPagination;
    counts: MyBookingsCounts;
}

export interface BookingDetailsResponse {
    bookingId: string;
    userId: string;
    mechanicId: string;
    vehicleId: string;
    bookingType: string;
    serviceType: string;
    serviceAddress: string;
    latitude?: number;
    longitude?: number;
    scheduledDate: string;
    slot: BookingSlot;
    bookingAmount: number;
    status: BookingStatus;
    reservationExpiresAt?: string;
    confirmedAt?: string;
    expiredAt?: string;
    createdAt?: string;
    updatedAt?: string;
    vehicle?: BookingVehicleSummary;
    mechanic?: BookingMechanicSummary;
    payment?: BookingDetailsPaymentSummary;
    allocation?: PaymentAllocationSummary;
}

export interface ScheduledBookingState {
    step: BookingStep;
    selectedVehicle: Vehicle | null;
    serviceType: string;
    location: BookingLocation | null;
    scheduledDate: string;
    slot: BookingSlot | null;
    discoveryResult: DiscoverMechanicsResponse | null;
    selectedMechanic: DiscoveredMechanicItem | null;
    reservation: CreateBookingReservationResponse | null;
    paymentOrder: CreatePaymentOrderResponse | null;
    confirmation: VerifyPaymentResponse | null;
    bookingStatus: BookingStatusResponse | null;
    bookingDetails: BookingDetailsResponse | null;
    paymentPhase: PaymentPhase;
}

