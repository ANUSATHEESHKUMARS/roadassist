import { MediaResponse } from "../../types/MediaResponse.js";

export interface IGetMediaUseCase {
    execute():Promise<MediaResponse[]>
}