export interface UploadMediaDto {
    buffer: Buffer;
    originalName: string;
    mimeType: string;
    size: number;
    section: string;
}