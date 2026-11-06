import { model, Schema, Types , Document} from "mongoose";

export type BookingType = "emergency" | "scheduled";
export type BookingSlot = "morning" | "afternoon" | "full_day";

export type BookingStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled";

export interface IBookingDocument extends Document {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    bookingType: BookingType,
    serviceType: string;
    serviceAddress: string;
    scheduledDate: Date;
    slot: BookingSlot;
    estimatedAmount: number,
    status: BookingStatus;

    requestedAt: Date;
    acceptedAt?: Date;
    completedAt?: Date;
    cancelledAt?: Date;
    createdAt:Date,
    updatedAt:Date

}

const bookingSchema = new Schema<IBookingDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    mechanicId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    bookingType: {
        type: String,
        enum: ["emergency", "scheduled"],
        required: true
    },
    serviceType: {
        type: String,
        required: true,
        trim: true
    },
    serviceAddress: {
        type: String,
        required: true
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    slot: {
        type: String,
        enum: ["morning", "afternoon", "full_day"],
        required: true
    },
    estimatedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: [
            "pending",
            "accepted",
            "rejected",
            "confirmed",
            "in_progress",
            "completed",
            "cancelled",
        ],
        default: "pending",
        required: true
    },
    requestedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    acceptedAt: {
        type: Date
    },
    completedAt: {
        type: Date
    },
    cancelledAt: {
        type: Date
    }

},{
    timestamps:true
})

export const BookingModel = model<IBookingDocument>("Booking",bookingSchema)