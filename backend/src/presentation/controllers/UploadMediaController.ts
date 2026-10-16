
import type { Request, Response } from "express";
import { IFileStorageService } from "../../application/contracts/IFileStorageService.js";
import { IUploadMediaUseCase } from "../../application/interfaces/IUploadMediaUseCase.js";
import { IGetMediaUseCase } from "../../application/interfaces/admin/IGetMediaUseCase.js";
import { IDeleteMediaUseCase } from "../../application/interfaces/admin/IDeleteMediauseCase.js";

import { CommonResponse } from "../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { MediaResponse } from "../../application/types/MediaResponse.js";

export class UploadMediaController {
  constructor(
    private readonly uploadMediaUseCase: IUploadMediaUseCase,
    private readonly getMediaUseCase: IGetMediaUseCase,
    private readonly deleteMediaUseCase: IDeleteMediaUseCase,
    private readonly filestorageService:IFileStorageService
  ) {}

  handle = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.file) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Media file is required",
        });
        return;
      }

      const { section } = req.body;

      if (!section) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Section is required",
        });
        return;
      }

      const media = await this.uploadMediaUseCase.execute({
        buffer: req.file.buffer,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        section,
      });

      const fileUrl = await this.filestorageService.getUrl(media.fileKey);

      res.status(HttpStatusCode.CREATED).json({
        success: true,
        message: "Media uploaded successfully",
        data: {
          id: media.id,
          originalName: media.originalName,
          fileKey: media.fileKey,
          url: fileUrl,
          fileUrl,
          mimeType: media.mimeType,
          mediaType: media.mediaType,
          size: media.size,
          section: media.section,
          createdAt: media.createdAt,
          updatedAt: media.updatedAt,
        },
      });
    } catch (error: unknown) {
      console.error("Upload media error:", error);

      res.status(HttpStatusCode.INTERNAL_SERVER).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to upload media",
      });
    }
  };

  // Get media
  handleGet = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const media = await this.getMediaUseCase.execute();

      const response: CommonResponse<MediaResponse[]> = {
        success: true,
        message: "Data fetched successfully",
        data: media,
      };

      res.status(HttpStatusCode.OK).json(response);
    } catch (error: unknown) {
      console.error("Get media error:", error);

      const response: CommonResponse = {
        success: false,
        message: "Failed to fetch media",
      };

      res.status(HttpStatusCode.INTERNAL_SERVER).json(response);
    }
  };

  // Delete media
  handleDelete = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || Array.isArray(id)) {
        const response: CommonResponse = {
          success: false,
          message: "Media ID is required",
        };

        res.status(HttpStatusCode.BAD_REQUEST).json(response);
        return;
      }

      await this.deleteMediaUseCase.execute(id);

      const response: CommonResponse = {
        success: true,
        message: "Media deleted successfully",
      };

      res.status(HttpStatusCode.OK).json(response);
    } catch (error: unknown) {
      console.error("Delete media error:", error);

      const response: CommonResponse = {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete media",
      };

      res.status(HttpStatusCode.INTERNAL_SERVER).json(response);
    }
  };
}
