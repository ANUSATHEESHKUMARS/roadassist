
import { Schema, Types, model, Document } from "mongoose";

export interface IMechanicApplicationDocument extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;

  profilePhotoKey?: string;
  experienceYears?: number;
  specialization?: string[];
  supportedVehicleTypes?: ("car" | "bike" | "auto" | "ev")[];
  serviceOffered?: string[];
  professionalDescription?: string;

  serviceModel?: "mobile" | "workshop" | "both";
  serviceAddress?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;

  workshopName?: string;
  workshopAddress?: string;

  documents?: {
    documentType: string;
    fileKey: string;
    originalName: string;
    mimeType: string;
    verificationStatus: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  }[];

  status:
    | "incomplete"
    | "pending"
    | "under_review"
    | "changes_requested"
    | "approved"
    | "rejected";

  submittedAt?: Date;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  reviewReason?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

const mechanicApplicationSchema =
  new Schema<IMechanicApplicationDocument>(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
      },

      profilePhotoKey: String,

      experienceYears: {
        type: Number,
        min: 0,
      },

      specialization: [String],

      supportedVehicleTypes: [
        {
          type: String,
          enum: ["car", "bike", "auto", "ev"],
        },
      ],

      serviceOffered: [String],
      professionalDescription: String,

      serviceModel: {
        type: String,
        enum: ["mobile", "workshop", "both"],
      },

      serviceAddress: String,

      pincode: {
        type: String,
        trim: true,
      },

      latitude: Number,
      longitude: Number,

      serviceRadiusKm: {
        type: Number,
        min: 0,
      },

      workshopName: String,
      workshopAddress: String,

      documents: [
        {
          documentType: {
            type: String,
            required: true,
          },
          fileKey: {
            type: String,
            required: true,
          },
          originalName: {
            type: String,
            required: true,
          },
          mimeType: {
            type: String,
            required: true,
          },
          verificationStatus: {
            type: String,
            enum: ["pending", "verified", "rejected"],
            default: "pending",
          },
          rejectionReason: String,
        },
      ],

      status: {
        type: String,
        enum: [
          "incomplete",
          "pending",
          "under_review",
          "changes_requested",
          "approved",
          "rejected",
        ],
        default: "incomplete",
        required: true,
      },

      submittedAt: Date,

      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },

      reviewedAt: Date,
      reviewReason: String,
    },
    {
      timestamps: true,
    }
  );

export const MechanicApplicationModel = model<IMechanicApplicationDocument>(
  "MechanicApplication",
  mechanicApplicationSchema
);
