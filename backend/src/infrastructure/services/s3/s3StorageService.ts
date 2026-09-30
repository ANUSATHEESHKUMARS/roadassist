import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";

import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import type { IFileStorageService } from "../../../application/contracts/IFileStorageService.js";
import { s3Config } from "./s3.Config.js";

export class S3StorageService implements IFileStorageService {

    private readonly s3Client: S3Client;

    constructor() {
        this.s3Client = new S3Client({
            region: s3Config.region,
            credentials: {
                accessKeyId: s3Config.accessKeyId,
                secretAccessKey: s3Config.secretAccessKey
            }
        });
    }

    async upload(
        file: Buffer,
        folder: string
    ): Promise<string> {

        const key = `${folder}/${Date.now()}`;

        const command = new PutObjectCommand({
            Bucket: s3Config.bucketName,
            Key: key,
            Body: file
        });

        await this.s3Client.send(command);

        return key;
    }

    async getUrl(
        fileKey: string
    ): Promise<string> {

        const command = new GetObjectCommand({
            Bucket: s3Config.bucketName,
            Key: fileKey
        });

        return await getSignedUrl(
            this.s3Client,
            command,
            {
                expiresIn: 3600
            }
        );
    }

    async delete(
        fileKey: string
    ): Promise<void> {

        const command = new DeleteObjectCommand({
            Bucket: s3Config.bucketName,
            Key: fileKey
        });

        await this.s3Client.send(command);
    }
}