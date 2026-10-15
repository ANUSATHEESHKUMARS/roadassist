export interface IFileStorageService {

    upload(
        file: Buffer,
        folder: string,
        contentType:string
    ): Promise<string>;

    getUrl(
        fileKey: string
    ): Promise<string>;

    delete(
        fileKey: string
    ): Promise<void>;
}