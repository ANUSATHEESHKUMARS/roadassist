import { Schema, Types, model, Document } from "mongoose";

export interface IMechanicAvailabilityDocument extends Document {
    _id: Types.ObjectId;
    mechanicId: Types.ObjectId;
    isAvailable: boolean;
    geoLocation: {
        type: "Point";
        coordinates: [number, number];
    };
    updatedAt: Date;
    createdAt: Date;
}

const mechanicAvailabilitySchema = new Schema<IMechanicAvailabilityDocument>(
    {
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        isAvailable: {
            type: Boolean,
            default: false,
            required: true,
        },
        geoLocation: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

mechanicAvailabilitySchema.index({ geoLocation: "2dsphere" });

export const MechanicAvailabilityModel = model<IMechanicAvailabilityDocument>(
    "MechanicAvailability",
    mechanicAvailabilitySchema
);

