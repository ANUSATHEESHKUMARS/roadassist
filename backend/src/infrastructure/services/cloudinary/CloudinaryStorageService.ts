import { UploadApiResponse } from "cloudinary";
import { IFileStorageService } from "../../../application/contracts/IFileStorageService.js";
import cloudinary from "./cloudinary.config.js";

export class CloudinaryStorageService implements IFileStorageService {

    async upload(
        file: Buffer,
        folder: string
    ): Promise<string> {

        return new Promise((resolve, reject) => {

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder
                },
                (
                    error: Error | undefined,
                    result: UploadApiResponse | undefined
                ) => {

                    if (error) {
                        reject(error);
                        return;
                    }

                    if (!result) {
                        reject(new Error("Cloudinary upload failed"));
                        return;
                    }

                    resolve(result.secure_url);
                }
            );

            uploadStream.end(file);
        });
    }

    async delete(publicId: string): Promise<void> {

        await cloudinary.uploader.destroy(publicId);
    }
}

