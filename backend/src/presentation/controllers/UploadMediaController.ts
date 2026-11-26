
import type { Request, Response, NextFunction } from "express";

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
    private readonly filestorageService: IFileStorageService
  ) { }

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction
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

      if (!section || typeof section !== "string" || !section.trim()) {
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
        section: section.trim(),
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
      next(error);
    }
  };

  handleGet = async (
    req: Request,
    res: Response,
    next: NextFunction
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
      next(error);
    }
  };

  handleDelete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== "string" || !id.trim()) {
        res.status(HttpStatusCode.BAD_REQUEST).json({
          success: false,
          message: "Media ID is required",
        });
        return;
      }

      await this.deleteMediaUseCase.execute(id);

      const response: CommonResponse = {
        success: true,
        message: "Media deleted successfully",
      };

      res.status(HttpStatusCode.OK).json(response);
    } catch (error: unknown) {
      next(error);
    }
  };
}
