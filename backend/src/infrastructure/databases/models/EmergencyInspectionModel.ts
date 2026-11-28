import { model, Schema, Types, Document } from "mongoose";
import type {
    EmergencyInspectionStatus,
    FindingSeverity,
} from "../../../domain/User/entities/EmergencyWorkflow.js";

export interface IEmergencyInspectionDocument extends Document {
    emergencyRequestId: Types.ObjectId;
    mechanicId: Types.ObjectId;
    vehicleId: Types.ObjectId;
    status: EmergencyInspectionStatus;
    vehicleConditionSummary?: string;
    findings: {
        component: string;
        issue: string;
        severity: FindingSeverity;
        recommendedAction?: string;
    }[];
    requiredRepairs: string[];
    notes?: string;
    startedAt?: Date;
    completedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const findingSchema = new Schema(
    {
        component: { type: String, required: true, trim: true, maxlength: 120 },
        issue: { type: String, required: true, trim: true, maxlength: 300 },
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
            required: true,
        },
        recommendedAction: { type: String, trim: true, maxlength: 300 },
    },
    { _id: false }
);

const emergencyInspectionSchema = new Schema<IEmergencyInspectionDocument>(
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
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "in_progress", "completed"],
            default: "pending",
            required: true,
        },
        vehicleConditionSummary: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        findings: {
            type: [findingSchema],
            default: [],
        },
        requiredRepairs: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 1000,
        },
        startedAt: { type: Date },
        completedAt: { type: Date },
    },
    { timestamps: true, versionKey: false }
);

export const EmergencyInspectionModel = model<IEmergencyInspectionDocument>(
    "EmergencyInspection",
    emergencyInspectionSchema
);

