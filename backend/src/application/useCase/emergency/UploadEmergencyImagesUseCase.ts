import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IUploadEmergencyRequestUploadUseCase } from "../../interfaces/IUploadEmergencyImagesUseCase.js";

export class UploadEmergencyImagesUseCase implements IUploadEmergencyRequestUploadUseCase {
    constructor(private readonly filestorageService: IFileStorageService) { }
   async execute(userId: string, files: Express.Multer.File[]): Promise<string[]> {
        if (!userId) {
            throw new UnauthorizedError("Authentication user is required", "AUTHENTICATION_REQUIRED")
        }
        if (files.length === 0) {
            throw new ConflictError("A maximum of 5 images is allowed")
        }
        const allowedTypes = [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/avif"
        ];

        const uploadedKeys: string[] = []

        try {
            for (const file of files) {
                if (!allowedTypes.includes(file.mimetype)) {
                    throw new ConflictError('Unsupported image type',"UNSUPPORTED_IMAGE_TYPE")
                }
                const fileKey = await this.filestorageService.upload(file.buffer,
                    `roadassist/emergency-issue/${userId}`,
                    file.mimetype
                )
                uploadedKeys.push(fileKey)
            }
            return uploadedKeys
    }catch(error){
            await Promise.allSettled(
                uploadedKeys.map(key => this.filestorageService.delete(key))
            )
            throw error
        }
    }
}