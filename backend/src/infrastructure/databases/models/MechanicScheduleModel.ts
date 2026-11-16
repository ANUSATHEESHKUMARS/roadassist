import { Schema, model, Types, Document } from "mongoose";
import {
    DayOfWeek,
    DailySchedule
} from "../../../domain/User/entities/MechanicSchedule.js";

export interface IMechanicScheduleDocument extends Document {
    _id: Types.ObjectId;
    mechanicId: Types.ObjectId;
    weeklyAvailability: DailySchedule[];
    morningStartTime: string;
    morningEndTime: string;
    eveningStartTime: string;
    eveningEndTime: string;
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
        evening: {
            type: Boolean,
            required: true,
            default: false
        }
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
            morningStartTime: {
                type: String,
                required: true
            },
            morningEndTime: {
                type: String,
                required: true
            },
            eveningStartTime: {
                type: String,
                required: true
            },
            eveningEndTime: {
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