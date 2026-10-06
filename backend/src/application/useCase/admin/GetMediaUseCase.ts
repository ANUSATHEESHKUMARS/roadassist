import { IMediaRepository } from "../../../domain/repositories/IMediaRepository.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IGetMediaUseCase } from "../../interfaces/admin/IGetMediaUseCase.js";
import { MediaResponse } from "../../types/MediaResponse.js";

export class GetMediaUseCase implements IGetMediaUseCase {
    constructor(private readonly mediaRepositoty: IMediaRepository,
        private readonly filestroageService: IFileStorageService
    ) { }
    async execute(): Promise<MediaResponse[]> {
        const mediaList = await this.mediaRepositoty.findAll()

        return Promise.all(
            mediaList.map(async (media) => {
                const url = await this.filestroageService.getUrl(media.fileKey)

                return {
                    id: media.id,
                    originalName: media.originalName,
                    fileKey: media.fileKey,
                    url,
                    mimeType: media.mimeType,
                    mediaType: media.mediaType,
                    size: media.size,
                    section: media.section,
                    createdAt: media.createdAt,
                    updatedAt: media.updatedAt
                }
            })
        )

    }

}