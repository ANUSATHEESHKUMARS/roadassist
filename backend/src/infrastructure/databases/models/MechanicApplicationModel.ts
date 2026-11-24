
import mongoose, {
    Schema,
    Types,
    Document,
    Model
} from "mongoose";
import {
    MechanicApplicationStatus,
    MechanicServiceModel,
    SupportedVehicleType,
    MechanicDocumentStatus,
    SpecializationVerificationStatus
} from "../../../domain/User/entities/MechanicApplication.js"


const SpecializationReviewHistorySchema = new Schema({
    decision: {
        type: String,
        enum: ["approved", "rejected"],
        required: true
    },

    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reviewedAt: {
        type: Date,
        required: true
    },

    rejectionReason: {
        type: String
    }

}, { _id: false });

const MechanicSubSpecializationSchema = new Schema({
    subcategoryId: {
        type: Schema.Types.ObjectId,
        required: true
    },

    verificationStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        required: true
    },

    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    reviewedAt: {
        type: Date
    },

    rejectionReason: {
        type: String
    },

    reviewHistory: {
        type: [SpecializationReviewHistorySchema],
        default: []
    }

}, { _id: false });


const MechanicSpecializationSchema = new Schema({
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "MechanicCategory",
        required: true
    },

    subcategories: {
        type: [MechanicSubSpecializationSchema],
        default: []
    }

}, { _id: false });


// ==========================================
// 3. MECHANIC DOCUMENT SCHEMA
// ==========================================

const MechanicDocumentSchema = new Schema({
    documentType: {
        type: String,
        required: true
    },

    fileKey: {
        type: String,
        required: true
    },

    originalName: {
        type: String,
        required: true
    },

    mimeType: {
        type: String,
        required: true
    },

    verificationStatus: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending"
    },

    rejectionReason: {
        type: String
    }

}, { _id: false });


// ==========================================
// 4. MECHANIC APPLICATION DOCUMENT INTERFACE
// ==========================================

export interface IMechanicApplicationDocument extends Document {

    userId: Types.ObjectId;

    profilePhotoKey?: string;

    experienceYears?: number;

    specializations: {
        categoryId: Types.ObjectId;

        subcategories: {
            subcategoryId: Types.ObjectId;
            verificationStatus: SpecializationVerificationStatus;
            reviewedBy?: Types.ObjectId;
            reviewedAt?: Date;
            rejectionReason?: string;

            reviewHistory?: {
                decision: "approved" | "rejected";
                reviewedBy: Types.ObjectId;
                reviewedAt: Date;
                rejectionReason?: string;
            }[];
        }[];
    }[];

    supportedVehicleTypes: SupportedVehicleType[];

    serviceOffered: string[];

    professionalDescription?: string;

    serviceModel?: MechanicServiceModel;

    serviceAddress?: string;

    pincode?: string;

    latitude?: number;

    longitude?: number;

    serviceRadiusKm?: number;

    workshopName?: string;

    workshopAddress?: string;

    documents: {
        documentType: string;
        fileKey: string;
        originalName: string;
        mimeType: string;
        verificationStatus: MechanicDocumentStatus;
        rejectionReason?: string;
    }[];

    status: MechanicApplicationStatus;

    submittedAt?: Date;

    reviewedBy?: Types.ObjectId;

    reviewedAt?: Date;

    reviewReason?: string;

    createdAt?: Date;

    updatedAt?: Date;
}


// ==========================================
// 5. MAIN MECHANIC APPLICATION SCHEMA
// ==========================================

const MechanicApplicationSchema = new Schema<IMechanicApplicationDocument>({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },

    profilePhotoKey: {
        type: String
    },

    experienceYears: {
        type: Number,
        min: 0
    },

    specializations: {
        type: [MechanicSpecializationSchema],
        default: []
    },

    supportedVehicleTypes: {
        type: [{
            type: String,
            enum: ["car", "bike", "auto", "ev"]
        }],
        default: []
    },

    serviceOffered: {
        type: [String],
        default: []
    },

    professionalDescription: {
        type: String
    },

    serviceModel: {
        type: String,
        enum: ["mobile", "workshop", "both"]
    },

    serviceAddress: {
        type: String
    },

    pincode: {
        type: String
    },

    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    serviceRadiusKm: {
        type: Number,
        min: 0
    },

    workshopName: {
        type: String
    },

    workshopAddress: {
        type: String
    },

    documents: {
        type: [MechanicDocumentSchema],
        default: []
    },

    status: {
        type: String,
        enum: [
            "incomplete",
            "pending",
            "under_review",
            "changes_requested",
            "approved",
            "rejected"
        ],
        default: "incomplete",
        required: true
    },

    submittedAt: {
        type: Date
    },

    reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    reviewedAt: {
        type: Date
    },

    reviewReason: {
        type: String
    }

}, {
    timestamps: true
});


// ==========================================
// 6. INDEXES
// ==========================================

MechanicApplicationSchema.index({ userId: 1 }, { unique: true });

MechanicApplicationSchema.index({ status: 1, createdAt: -1 });

MechanicApplicationSchema.index({
    "specializations.categoryId": 1
});



export const MechanicApplicationModel: Model<IMechanicApplicationDocument> =
    (mongoose.models.MechanicApplication as Model<IMechanicApplicationDocument>) ||
    mongoose.model<IMechanicApplicationDocument>(
        "MechanicApplication",
        MechanicApplicationSchema
    );