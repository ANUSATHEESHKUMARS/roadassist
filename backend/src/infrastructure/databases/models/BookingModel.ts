import { model, Schema, Types, Document } from "mongoose";
import { BookingSlot, BookingStatus, BookingType } from "../../../domain/User/Types/BookingTypes.js";

export type { BookingType, BookingSlot, BookingStatus };

export interface IBookingDocument extends Document {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    bookingType: BookingType;
    serviceType: string;
    serviceAddress: string;
    latitude?: number;
    longitude?: number;
    scheduledDate: Date;
    scheduledDateDayKey?: string;
    slot: BookingSlot;
    occupiedShifts?: ("morning" | "afternoon")[];

    bookingAmount: number;
    estimatedAmount?: number;

    status: BookingStatus;

    reservationExpiresAt?: Date;
    paymentId?: Types.ObjectId;
    confirmedAt?: Date;
    expiredAt?: Date;

    requestedAt: Date;
    acceptedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema = new Schema<IBookingDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },

        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        bookingType: {
            type: String,
            enum: ["emergency", "scheduled"],
            required: true,
        },

        serviceType: {
            type: String,
            required: true,
            trim: true,
        },

        serviceAddress: {
            type: String,
            required: true,
            trim: true,
        },

        latitude: {
            type: Number,
            required: false,
        },

        longitude: {
            type: Number,
            required: false,
        },

        scheduledDate: {
            type: Date,
            required: true,
        },

        scheduledDateDayKey: {
            type: String,
            required: false,
        },

        slot: {
            type: String,
            enum: ["morning", "afternoon", "full_day"],
            required: true,
        },

        occupiedShifts: {
            type: [String],
            enum: ["morning", "afternoon"],
            required: false,
        },

        bookingAmount: {
            type: Number,
            required: true,
            min: 800,
        },

        estimatedAmount: {
            type: Number,
            required: false,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "pending_payment",
                "accepted",
                "rejected",
                "confirmed",
                "in_progress",
                "completed",
                "cancelled",
                "expired",
            ],
            default: "pending",
            required: true,
        },

        reservationExpiresAt: {
            type: Date,
            required: false,
        },

        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            required: false,
        },

        confirmedAt: {
            type: Date,
            required: false,
        },

        expiredAt: {
            type: Date,
            required: false,
        },

        requestedAt: {
            type: Date,
            default: Date.now,
            required: true,
        },

        acceptedAt: {
            type: Date,
        },

        completedAt: {
            type: Date,
        },

        cancelledAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Customer booking history
bookingSchema.index({
    userId: 1,
    createdAt: -1,
});

// Mechanic booking history
bookingSchema.index({
    mechanicId: 1,
    createdAt: -1,
});

// Mechanic availability/conflict lookup
bookingSchema.index({
    mechanicId: 1,
    scheduledDate: 1,
    status: 1,
    slot: 1,
});

// Atomic overlapping shift lock for active/pending_payment scheduled bookings
bookingSchema.index(
    {
        mechanicId: 1,
        scheduledDateDayKey: 1,
        occupiedShifts: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            scheduledDateDayKey: { $exists: true },
            occupiedShifts: { $exists: true },
            status: {
                $in: [
                    "pending_payment",
                    "pending",
                    "accepted",
                    "confirmed",
                    "in_progress",
                ],
            },
        },
        name: "unique_active_mechanic_shift_per_day",
    }
);

// Stale reservation expiry lookup
bookingSchema.index({
    status: 1,
    reservationExpiresAt: 1,
});

export const BookingModel = model<IBookingDocument>(
    "Booking",
    bookingSchema
);
