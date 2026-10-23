import { model, Schema, Types, Document } from "mongoose";
import { EmergencyIssueCategory } from "../../../domain/User/entities/EmergencyRequest.js";

export type EmergencyRequestStatus =

    | "pending"
    | "searching"
    | "assigned"
    | "cancelled"
    | "completed"


export interface IEmergencyRequestDocument extends Document {
    userId: Types.ObjectId;
    vehicleId: Types.ObjectId

    location: {
        latitude: number;
        longitude: number;
        address?: string
    }
    emergencyIssueCategory: EmergencyIssueCategory;
    issueTitle: string;
    issueDescription: string;
    issueImages: string[];
    status: EmergencyRequestStatus;
    assignedMechanicId: Types.ObjectId | null;

    createdAt: Date;
    updatedAt: Date
}


const emergencyRequestSchema = new Schema<IEmergencyRequestDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    vehicleId: {
        type: Schema.Types.ObjectId,
        ref: "Vehicle",
        required: true
    },
    location: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        address: {
            type: String,
            trim: true
        }
    },
    emergencyIssueCategory: {
        type: String,
        enum: [
            "battery",
            "flat_tyre",
            "engine",
            "brake",
            "electrical",
            "fuel",
            "accident",
            "overheating",
            "noise",
            "other",
        ],
        required: true

    },
    issueTitle: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxlength: 150
    },

    issueDescription: {
        type: String,
        required: true,
        trim: true,
        minLength: 3,
        maxLength: 1000
    },
    issueImages: {
        type: [String],
        default: [],
        validate: {
            validator: (images: string[]) => images.length <= 5,
            message: "A maximum of 5 images is allowed"
        },
    },
    status: {
        type: String,
        enum: [
            "pending",
            "searching",
            "assigned",
            "cancelled",
            "completed"
        ],
        default: "pending",
        required: true
    },
    assignedMechanicId: {
        type: Schema.Types.ObjectId,
        ref: "Mechanic",
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
})


export const EmergencyRequestModel = model<IEmergencyRequestDocument>("EmergencyRequest", emergencyRequestSchema)