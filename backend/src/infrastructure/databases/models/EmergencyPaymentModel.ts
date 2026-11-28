import { model, Schema, Types, Document } from "mongoose";
import type { EmergencyPaymentStatus } from "../../../domain/User/entities/EmergencyWorkflow.js";

export interface IEmergencyPaymentDocument extends Document {
    emergencyRequestId: Types.ObjectId;
    estimateId: Types.ObjectId;
    estimateRevision: number;
    customerId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    amount: number;
    amountPaise: number;
    currency: string;
    razorpayOrderId: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status: EmergencyPaymentStatus;
    idempotencyKey: string;
    failureReason?: string;
    paidAt?: Date;
    refundedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const emergencyPaymentSchema = new Schema<IEmergencyPaymentDocument>(
    {
        emergencyRequestId: {
            type: Schema.Types.ObjectId,
            ref: "EmergencyRequest",
            required: true,
            index: true,
        },
        estimateId: {
            type: Schema.Types.ObjectId,
            ref: "EmergencyEstimate",
            required: true,
            index: true,
        },
        estimateRevision: {
            type: Number,
            required: true,
            min: 1,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        amount: { type: Number, required: true, min: 0 },
        amountPaise: { type: Number, required: true, min: 0 },
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
            unique: true,
            sparse: true,
            trim: true,
        },
        razorpaySignature: {
            type: String,
            required: false,
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "processing", "paid", "failed", "refunded"],
            default: "pending",
            required: true,
        },
        idempotencyKey: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        failureReason: { type: String, trim: true, maxlength: 500 },
        paidAt: { type: Date },
        refundedAt: { type: Date },
    },
    { timestamps: true, versionKey: false }
);

export const EmergencyPaymentModel = model<IEmergencyPaymentDocument>(
    "EmergencyPayment",
    emergencyPaymentSchema
);

