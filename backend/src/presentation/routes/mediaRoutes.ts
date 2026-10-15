import { Router } from "express";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadMediaController } from "../../di/container.js";

const mediaRouter = Router()

mediaRouter.get('/', asyncHandler(uploadMediaController.handleGet))



export default mediaRouter