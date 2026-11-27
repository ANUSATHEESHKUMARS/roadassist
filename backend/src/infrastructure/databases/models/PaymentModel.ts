import { model, Schema, Types, Document } from "mongoose";
import { PaymentStatus } from "../../../domain/User/Types/BookingTypes.js";

export interface IPaymentDocument extends Document {
    bookingId: Types.ObjectId;
    userId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    amount: number;
    amountPaise: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: PaymentStatus;
    idempotencyKey: string;
    failureReason?: string;
    refundId?: string;
    paidAt?: Date;
    refundedAt?: Date;
    metadata?: Map<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPaymentDocument>(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: "Booking",
            required: true,
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        amountPaise: {
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
        razorpayOrderId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        razorpayPaymentId: {
            type: String,
            required: false,
            sparse: true,
            unique: true,
            trim: true,
        },
        razorpaySignature: {
            type: String,
            required: false,
            trim: true,
        },
        status: {
            type: String,
            enum: [
                "created",
                "pending",
                "paid",
                "failed",
                "refund_requested",
                "refund_pending",
                "refunded",
            ],
            default: "created",
            required: true,
        },
        idempotencyKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        failureReason: {
            type: String,
            required: false,
            trim: true,
        },
        refundId: {
            type: String,
            required: false,
            trim: true,
        },
        paidAt: {
            type: Date,
            required: false,
        },
        refundedAt: {
            type: Date,
            required: false,
        },
        metadata: {
            type: Map,
            of: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

paymentSchema.index({ bookingId: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });

export const PaymentModel = model<IPaymentDocument>("Payment", paymentSchema);

