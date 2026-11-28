import { model, Schema, Types, Document } from "mongoose";
import type { EmergencyRepairStatus } from "../../../domain/User/entities/EmergencyWorkflow.js";

export interface IEmergencyRepairDocument extends Document {
    emergencyRequestId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    estimateId: Types.ObjectId;
    status: EmergencyRepairStatus;
    progressLogs: {
        note: string;
        loggedAt: Date;
    }[];
    workPerformed?: string;
    partsUsed: {
        name: string;
        quantity: number;
        notes?: string;
    }[];
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const progressLogSchema = new Schema(
    {
        note: { type: String, required: true, trim: true, maxlength: 300 },
        loggedAt: { type: Date, required: true, default: Date.now },
    },
    { _id: false }
);

const partUsedSchema = new Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 200 },
        quantity: { type: Number, required: true, min: 1 },
        notes: { type: String, trim: true, maxlength: 250 },
    },
    { _id: false }
);

const emergencyRepairSchema = new Schema<IEmergencyRepairDocument>(
    {
        emergencyRequestId: {
            type: Schema.Types.ObjectId,
            ref: "EmergencyRequest",
            required: true,
            unique: true,
            index: true,
        },
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        estimateId: {
            type: Schema.Types.ObjectId,
            ref: "EmergencyEstimate",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
            required: true,
        },
        progressLogs: {
            type: [progressLogSchema],
            default: [],
        },
        workPerformed: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
        partsUsed: {
            type: [partUsedSchema],
            default: [],
        },
        startedAt: { type: Date },
        completedAt: { type: Date },
    },
    { timestamps: true, versionKey: false }
);

export const EmergencyRepairModel = model<IEmergencyRepairDocument>(
    "EmergencyRepair",
    emergencyRepairSchema
);

