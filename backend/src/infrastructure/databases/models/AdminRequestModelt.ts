import { Schema, model, Types, Document } from 'mongoose'

export type AdminRequestStatus =
    | "pending"
    | "approved"
    | "rejected"

export interface IAdminRequestDocument extends Document {
    userId: Types.ObjectId,
    status: AdminRequestStatus,
    requestedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: Types.ObjectId;
}

const adminRequestSchema = new Schema<IAdminRequestDocument>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
        required: true
    },

    requestedAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    reviewedAt : {
        type : Date,
    },
    reviewedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },
},
{
    timestamps : true
})


export const AdminRequestModel = model<IAdminRequestDocument>("AdminRequest" , adminRequestSchema)