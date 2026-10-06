import  { Media } from '../User/entities/Media.js'

export interface IMediaRepository {
    
    create(media: Media): Promise<Media>;

    findById(id: string): Promise<Media | null>;

    findAll(): Promise<Media[]>;

    delete(id: string): Promise<void>;
}