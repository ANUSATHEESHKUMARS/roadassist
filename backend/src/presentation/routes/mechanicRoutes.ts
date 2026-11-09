import { Router } from "express";
import {
  auth,
  mechanicApplicationController,
  uploadMediaController,
  mechanicEmergencyController,
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

mechanicRouter.get(
  "/my-application",
  auth,
  asyncHandler(mechanicApplicationController.getMyApplication)
);

mechanicRouter.post(
  "/media/upload",
  auth,
  uploadMedia.single("file"),
  asyncHandler(uploadMediaController.handle)
);

// ─── Mechanic Emergency Endpoints ───────────────────────────────────────────

mechanicRouter.patch(
  "/availability",
  auth,
  asyncHandler(mechanicEmergencyController.updateAvailability)
);

mechanicRouter.get(
  "/emergency-requests/nearby",
  auth,
  asyncHandler(mechanicEmergencyController.getNearbyRequests)
);

mechanicRouter.post(
  "/emergency-requests/:id/accept",
  auth,
  asyncHandler(mechanicEmergencyController.acceptRequest)
);

mechanicRouter.post(
  "/emergency-requests/:id/reject",
  auth,
  asyncHandler(mechanicEmergencyController.rejectRequest)
);

export default mechanicRouter;
