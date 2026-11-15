import { Router } from "express";
import {
  auth,
  mechanicApplicationController,
  uploadMediaController,
  mechanicEmergencyController,
} from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadMedia } from "../middlewares/uploadMedia.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";

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
  authorizeRoles("mechanic"),
  asyncHandler(mechanicEmergencyController.updateAvailability)
);
// Nearby requests
mechanicRouter.get(
    "/emergency-requests/nearby",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.getNearbyRequests)
);

// All accepted requests
mechanicRouter.get(
    "/emergency-requests/assigned",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.getAssignedRequests)
);

// Single assigned request
mechanicRouter.get(
    "/emergency-requests/:id",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.getAssignedRequest)
);

// Accept request
mechanicRouter.post(
    "/emergency-requests/:id/accept",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.acceptRequest)
);

// Reject request
mechanicRouter.post(
    "/emergency-requests/:id/reject",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.rejectRequest)
);

export default mechanicRouter;
