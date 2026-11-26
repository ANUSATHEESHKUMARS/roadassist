
import { Media } from "../../../domain/User/entities/Media.js";
import { UploadMediaDto } from "../../dtos/UploadMediaDto.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IMediaRepository } from "../../../domain/repositories/IMediaRepository.js";
import { IUploadMediaUseCase } from "../../interfaces/IUploadMediaUseCase.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";

export class UploadMediaUseCase implements IUploadMediaUseCase {

    constructor(
        private readonly mediaRepository: IMediaRepository,
        private readonly fileStorageService: IFileStorageService
    ) {}

    async execute(dto: UploadMediaDto): Promise<Media> {

        if (!dto.buffer || !dto.mimeType) {
            throw new BadRequest("Media file and MIME type are required", "INVALID_MEDIA_FILE");
        }

        const sanitizedSection = (dto.section || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");

        if (!sanitizedSection) {
            throw new BadRequest("Valid section identifier is required", "INVALID_MEDIA_SECTION");
        }

        const fileKey = await this.fileStorageService.upload(
            dto.buffer,
            `landing/${sanitizedSection}`,
            dto.mimeType
        );

        try {

            const mediaType =
                dto.mimeType.startsWith("image/")
                    ? "image"
                    : "video";

            const media = new Media({
                originalName: dto.originalName,
                fileKey,
                mimeType: dto.mimeType,
                mediaType,
                size: dto.size,
                section: sanitizedSection,
            });

            const savedMedia =
                await this.mediaRepository.create(media);

            return savedMedia;

        } catch (error) {

            await this.fileStorageService.delete(fileKey);

            throw error;
        }
    }
}

