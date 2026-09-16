import { v2 as cloudinary } from "cloudinary";
import { ConflictError } from "../../../shared/errors/ConflitError.js";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
    throw new ConflictError("Cloudinary environment variables are missing","CLOUDINARY_CONFIG_ERROR");
}

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

export default cloudinary;