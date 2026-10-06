
import { Media } from "../../../domain/User/entities/Media.js";
import { UploadMediaDto } from "../../dtos/UploadMediaDto.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IMediaRepository } from "../../../domain/repositories/IMediaRepository.js";
import { IUploadMediaUseCase } from "../../interfaces/IUploadMediaUseCase.js";




export class UploadMediaUseCase implements IUploadMediaUseCase {

    constructor(
        private readonly mediaRepository: IMediaRepository,
        private readonly fileStorageService: IFileStorageService
    ) {}

    async execute(dto: UploadMediaDto): Promise<Media> {

        const fileKey = await this.fileStorageService.upload(
            dto.buffer,
            `landing/${dto.section}`
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
                section: dto.section,
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