import { Router } from "express";
import {
  auth,
  mechanicApplicationController,
  uploadMediaController,
} from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadMedia } from "../middlewares/uploadMedia.js";

const mechanicRouter = Router();

mechanicRouter.patch(
  "/draft",
  auth,
  asyncHandler(mechanicApplicationController.saveDraft)
);

mechanicRouter.post(
  "/submit",
  auth,
  asyncHandler(mechanicApplicationController.submitApplication)
);

mechanicRouter.post(
  "/media/upload",
  auth,
  uploadMedia.single("file"),
  asyncHandler(uploadMediaController.handle)
);

export default mechanicRouter;