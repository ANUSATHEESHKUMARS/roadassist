import { MediaType } from "../../domain/User/entities/Media.js";

export interface MediaResponse {
    id:string | undefined;
    originalName:string,
    fileKey:string,
    url:string,
    mediaType:MediaType,
    size:number;
    section:string,
    createdAt:Date;
    updatedAt:Date
}