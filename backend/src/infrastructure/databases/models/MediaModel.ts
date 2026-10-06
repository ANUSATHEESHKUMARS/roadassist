import { Schema, model } from "mongoose";

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
        },
    },
    {
        timestamps: true,
    }
);

export const MediaModel = model("Media", mediaSchema);