import { IMediaRepository } from "../../../domain/repositories/IMediaRepository.js";
import { IFileStorageService } from "../../contracts/IFileStorageService.js";
import { IDeleteMediaUseCase } from "../../interfaces/admin/IDeleteMediauseCase.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";

export class DeleteMediaUseCase implements IDeleteMediaUseCase{
    constructor(private mediaRepository : IMediaRepository,
        private fileStorageService : IFileStorageService
    ){}

   async execute(id: string): Promise<void> {
        const response = await this.mediaRepository.findById(id)
        if(!response){
            throw new NotfoundError("media not found" , "MEDIA_NOT_FOUND")
        }

        await this.fileStorageService.delete(response.fileKey)
        await this.mediaRepository.delete(id)
    }
}