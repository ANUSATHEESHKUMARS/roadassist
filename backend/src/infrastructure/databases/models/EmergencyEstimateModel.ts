import { model, Schema, Types, Document } from "mongoose";
import type {
    EmergencyEstimateStatus,
    EstimateItemCategory,
} from "../../../domain/User/entities/EmergencyWorkflow.js";

export interface IEmergencyEstimateDocument extends Document {
    emergencyRequestId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    customerId: Types.ObjectId;
    inspectionId: Types.ObjectId;
    revision: number;
    inspectionCharge: number;
    items: {
        category: EstimateItemCategory;
        description: string;
        quantity: number;
        unitPrice: number;
        totalPrice: number;
    }[];
    partsTotal: number;
    labourTotal: number;
    additionalTotal: number;
    totalAmount: number;
    estimatedCompletionMinutes?: number;
    notes?: string;
    status: EmergencyEstimateStatus;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const estimateItemSchema = new Schema(
    {
        category: {
            type: String,
            enum: ["part", "labour", "additional"],
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 250,
        },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        totalPrice: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const emergencyEstimateSchema = new Schema<IEmergencyEstimateDocument>(
    {
        emergencyRequestId: {
            type: Schema.Types.ObjectId,
            ref: "EmergencyRequest",
            required: true,
            index: true,
        },
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        inspectionId: {
            type: Schema.Types.ObjectId,
            ref: "EmergencyInspection",
            required: true,
        },
        revision: {
            type: Number,
            required: true,
            min: 1,
        },
        inspectionCharge: {
            type: Number,
            required: true,
            min: 0,
        },
        items: {
            type: [estimateItemSchema],
            default: [],
        },
        partsTotal: { type: Number, required: true, min: 0 },
        labourTotal: { type: Number, required: true, min: 0 },
        additionalTotal: { type: Number, required: true, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        estimatedCompletionMinutes: { type: Number, min: 1 },
        notes: { type: String, trim: true, maxlength: 1000 },
        status: {
            type: String,
            enum: ["draft", "submitted", "approved", "rejected", "revised", "paid"],
            default: "submitted",
            required: true,
        },
        submittedAt: { type: Date },
        approvedAt: { type: Date },
        rejectedAt: { type: Date },
        rejectionReason: { type: String, trim: true, maxlength: 500 },
        paidAt: { type: Date },
    },
    { timestamps: true, versionKey: false }
);

emergencyEstimateSchema.index(
    { emergencyRequestId: 1, revision: 1 },
    { unique: true }
);

export const EmergencyEstimateModel = model<IEmergencyEstimateDocument>(
    "EmergencyEstimate",
    emergencyEstimateSchema
);

