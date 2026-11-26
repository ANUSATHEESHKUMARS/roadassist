import mongoose, { Schema, model, Model } from "mongoose";

const mediaSchema = new Schema(
    {
        originalName: {
            type: String,
            required: true,
        },

        fileKey: {
            type: String,
            required: true,
        },

        mimeType: {
            type: String,
            required: true,
        },

        mediaType: {
            type: String,
            enum: ["image", "video"],
            required: true,
        },

        size: {
            type: Number,
            required: true,
        },

        section: {
            type: String,
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

mediaSchema.index({ section: 1, createdAt: -1 });

export const MediaModel = (mongoose.models.Media as Model<any>) || model("Media", mediaSchema);