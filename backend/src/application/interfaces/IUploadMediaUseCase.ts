import { Media } from "../../domain/User/entities/Media.js";
import { UploadMediaDto } from "../dtos/UploadMediaDto.js";
export interface IUploadMediaUseCase {
    execute(dto: UploadMediaDto): Promise<Media>;
}