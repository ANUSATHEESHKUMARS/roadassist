export interface IFileStorageService {
    upload(
        file:Buffer,
        folder:string,
    ):Promise<string>

    delete(
        publicId:string
    ):Promise<void>
}