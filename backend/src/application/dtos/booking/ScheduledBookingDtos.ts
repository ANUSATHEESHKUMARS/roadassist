import {
    AllocationStatus,
    BookingSlot,
    BookingStatus,
    PaymentStatus,
} from "../../../domain/User/Types/BookingTypes.js";
import { MechanicServiceModel } from "../../../domain/User/entities/MechanicApplication.js";

export interface DiscoverMechanicsDto {
    scheduledDate: string;
    slot: BookingSlot;
    vehicleId: string;
    serviceType: string;
    latitude: number;
    longitude: number;
    serviceMode?: "mobile" | "workshop";
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

export interface DiscoverMechanicsResponseDto {
    scheduledDate: string;
    slot: BookingSlot;
    bookingAmount: number;
    currency: string;
    mechanics: DiscoveredMechanicItem[];
}

export interface CreateBookingReservationDto {
    mechanicId: string;
    vehicleId: string;
    serviceType: string;
    serviceAddress: string;
    scheduledDate: string;
    slot: BookingSlot;
    latitude: number;
    longitude: number;
    serviceMode?: "mobile" | "workshop";
}

export interface CreateBookingReservationResponseDto {
    bookingId: string;
    status: BookingStatus;
    mechanicId: string;
    vehicleId: string;
    serviceType: string;
    serviceAddress: string;
    scheduledDate: Date;
    slot: BookingSlot;
    bookingAmount: number;
    currency: string;
    reservationExpiresAt: Date;
}

export interface CreatePaymentOrderDto {
    bookingId: string;
}

export interface CreatePaymentOrderResponseDto {
    bookingId: string;
    paymentId: string;
    razorpayOrderId: string;
    amount: number;
    amountPaise: number;
    currency: string;
    keyId: string;
    reservationExpiresAt?: Date;
}

export interface VerifyPaymentDto {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}

export interface PaymentAllocationSummaryDto {
    id: string;
    totalAmount: number;
    superAdminShare: number;
    adminShare: number;
    mechanicShare: number;
    currency: string;
    status: AllocationStatus;
    allocatedAt?: Date;
}

export interface VerifyPaymentResponseDto {
    bookingId: string;
    bookingStatus: BookingStatus;
    paymentId: string;
    paymentStatus: PaymentStatus;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    amount: number;
    currency: string;
    confirmedAt?: Date;
    allocation: PaymentAllocationSummaryDto;
}

export interface BookingStatusResponseDto {
    bookingId: string;
    status: BookingStatus;
    scheduledDate: Date;
    slot: BookingSlot;
    bookingAmount: number;
    reservationExpiresAt?: Date;
    confirmedAt?: Date;
    expiredAt?: Date;
    payment?: {
        paymentId: string;
        status: PaymentStatus;
        razorpayOrderId: string;
        razorpayPaymentId?: string;
        failureReason?: string;
        paidAt?: Date;
        refundedAt?: Date;
    };
}

export interface BookingVehicleSummaryDto {
    vehicleId: string;
    brand: string;
    model: string;
    registrationNumber: string;
    vehicleType: string;
}

export interface BookingMechanicSummaryDto {
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

export interface GetMyBookingsQueryDto {
    page?: number;
    limit?: number;
    category?: BookingHistoryCategory;
}

export interface MyBookingItemDto {
    bookingId: string;
    bookingType: string;
    serviceType: string;
    serviceAddress: string;
    scheduledDate: Date;
    slot: BookingSlot;
    bookingAmount: number;
    status: BookingStatus;
    paymentStatus?: PaymentStatus;
    reservationExpiresAt?: Date;
    confirmedAt?: Date;
    createdAt?: Date;
    vehicle?: BookingVehicleSummaryDto;
    mechanic?: BookingMechanicSummaryDto;
}

export interface GetMyBookingsResponseDto {
    bookings: MyBookingItemDto[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
    counts: {
        all: number;
        upcoming: number;
        completed: number;
        cancelled: number;
    };
}

export interface BookingDetailsResponseDto {
    bookingId: string;
    userId: string;
    mechanicId: string;
    vehicleId: string;
    bookingType: string;
    serviceType: string;
    serviceAddress: string;
    latitude?: number;
    longitude?: number;
    scheduledDate: Date;
    slot: BookingSlot;
    bookingAmount: number;
    status: BookingStatus;
    reservationExpiresAt?: Date;
    confirmedAt?: Date;
    expiredAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    vehicle?: BookingVehicleSummaryDto;
    mechanic?: BookingMechanicSummaryDto;
    payment?: {
        paymentId: string;
        status: PaymentStatus;
        razorpayOrderId: string;
        razorpayPaymentId?: string;
        amount: number;
        currency: string;
        failureReason?: string;
        refundId?: string;
        paidAt?: Date;
        refundedAt?: Date;
    };
    allocation?: PaymentAllocationSummaryDto;
}

export interface WebhookProcessResultDto {
    received: boolean;
    event: string;
    processed: boolean;
    message: string;
}

