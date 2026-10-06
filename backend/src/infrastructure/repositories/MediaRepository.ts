import { Media } from "../../domain/User/entities/Media.js";
import { IMediaRepository } from "../../domain/repositories/IMediaRepository.js";
import { MediaModel } from "../databases/models/MediaModel.js";
export class MediaRepository implements IMediaRepository {

    async create(media: Media): Promise<Media> {

        const document = await MediaModel.create({
            originalName: media.originalName,
            fileKey: media.fileKey,
            mimeType: media.mimeType,
            mediaType: media.mediaType,
            size: media.size,
            section: media.section,
        });

        return new Media({
            id: document._id.toString(),

            originalName: document.originalName,
            fileKey: document.fileKey,
            mimeType: document.mimeType,
            mediaType: document.mediaType,
            size: document.size,
            section: document.section,

            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        });
    }

    async findById(id: string): Promise<Media | null> {

        const document = await MediaModel.findById(id);

        if (!document) {
            return null;
        }

        return new Media({
            id: document._id.toString(),

            originalName: document.originalName,
            fileKey: document.fileKey,
            mimeType: document.mimeType,
            mediaType: document.mediaType,
            size: document.size,
            section: document.section,

            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        });
    }

    async findAll(): Promise<Media[]> {

        const documents = await MediaModel.find()
            .sort({ createdAt: -1 });

        return documents.map((document) => {
            return new Media({
                id: document._id.toString(),

                originalName: document.originalName,
                fileKey: document.fileKey,
                mimeType: document.mimeType,
                mediaType: document.mediaType,
                size: document.size,
                section: document.section,

                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
            });
        });
    }

    async delete(id: string): Promise<void> {

        await MediaModel.findByIdAndDelete(id);
    }
}


