import { model, Schema, Types, Document } from "mongoose";
import { AllocationStatus } from "../../../domain/User/Types/BookingTypes.js";

export interface IPaymentAllocationDocument extends Document {
    paymentId: Types.ObjectId;
    bookingId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    totalAmount: number;
    superAdminShare: number;
    adminShare: number;
    mechanicShare: number;
    currency: string;
    status: AllocationStatus;
    allocatedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const paymentAllocationSchema = new Schema<IPaymentAllocationDocument>(
    {
        paymentId: {
            type: Schema.Types.ObjectId,
            ref: "Payment",
            required: true,
            unique: true,
        },
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
            unique: true,
        },
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        superAdminShare: {
            type: Number,
            required: true,
            min: 0,
        },
        adminShare: {
            type: Number,
            required: true,
            min: 0,
        },
        mechanicShare: {
            type: Number,
            required: true,
            min: 0,
        },
        currency: {
            type: String,
            required: true,
            default: "INR",
            uppercase: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "allocated", "reversed"],
            default: "allocated",
            required: true,
        },
        allocatedAt: {
            type: Date,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

paymentAllocationSchema.index({ mechanicId: 1, createdAt: -1 });

export const PaymentAllocationModel = model<IPaymentAllocationDocument>(
    "PaymentAllocation",
    paymentAllocationSchema
);

