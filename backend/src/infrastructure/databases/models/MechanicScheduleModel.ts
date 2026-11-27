
import { Schema, model, Types, Document } from "mongoose";
import {
    DailySchedule,
    DateAvailability,
} from "../../../domain/User/entities/MechanicSchedule.js";

export interface IMechanicScheduleDocument extends Document {
    _id: Types.ObjectId;
    mechanicId: Types.ObjectId;
    weeklyAvailability: DailySchedule[];
    dateAvailability: DateAvailability[];
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const dailyScheduleSchema = new Schema<DailySchedule>(
    {
        day: {
            type: String,
            enum: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday"
            ],
            required: true
        },
        morning: {
            type: Boolean,
            required: true,
            default: false
        },
        afternoon: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    { _id: false }
);

const dateAvailabilitySchema = new Schema<DateAvailability>(
    {
        date: {
            type: String,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            required: true,
            default: true,
        },
        morning: {
            type: Boolean,
            required: true,
            default: false,
        },
        afternoon: {
            type: Boolean,
            required: true,
            default: false,
        },
        morningStartTime: {
            type: String,
            required: false,
        },
        morningEndTime: {
            type: String,
            required: false,
        },
        afternoonStartTime: {
            type: String,
            required: false,
        },
        afternoonEndTime: {
            type: String,
            required: false,
        },
    },
    { _id: false }
);

const mechanicScheduleSchema =
    new Schema<IMechanicScheduleDocument>(
        {
            mechanicId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
                unique: true
            },
            weeklyAvailability: {
                type: [dailyScheduleSchema],
                required: true
            },
            dateAvailability: {
                type: [dateAvailabilitySchema],
                default: []
            },
            morningStartTime: {
                type: String,
                required: true
            },
            morningEndTime: {
                type: String,
                required: true
            },
            afternoonStartTime: {
                type: String,
                required: true
            },
            afternoonEndTime: {
                type: String,
                required: true
            },
            isActive: {
                type: Boolean,
                default: true,
                required: true
            }
        },
        {
            timestamps: true,
            versionKey: false
        }
    );

export const MechanicScheduleModel =
    model<IMechanicScheduleDocument>(
        "MechanicSchedule",
        mechanicScheduleSchema
    );
