import { Router } from "express";
import {
  auth,
  mechanicApplicationController,
  uploadMediaController,
  mechanicEmergencyController,
  emergencyWorkflowController,
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

mechanicRouter.get(
    "/emergency-requests/nearby",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.getNearbyRequests)
);

mechanicRouter.get(
    "/emergency-requests/assigned",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.getAssignedRequests)
);

mechanicRouter.get(
    "/emergency-requests/:id",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.getAssignedRequest)
);

mechanicRouter.post(
    "/emergency-requests/:id/accept",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.acceptRequest)
);

mechanicRouter.post(
    "/emergency-requests/:id/reject",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicEmergencyController.rejectRequest)
);

mechanicRouter.patch(
  "/emergency-requests/:id/start-travel",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(mechanicEmergencyController
    .startTravel
  )
)

mechanicRouter.patch(
  "/emergency-requests/:id/confirm-arrival",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(mechanicEmergencyController.confirmArrival)
)

mechanicRouter.post(
  "/emergency-requests/:id/inspection/start",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.startInspection)
);

mechanicRouter.post(
  "/emergency-requests/:id/inspection/complete",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.completeInspection)
);

mechanicRouter.post(
  "/emergency-requests/:id/estimates",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.submitEstimate)
);

mechanicRouter.post(
  "/emergency-requests/:id/repair/start",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.startRepair)
);

mechanicRouter.post(
  "/emergency-requests/:id/repair/progress",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.logRepairProgress)
);

mechanicRouter.post(
  "/emergency-requests/:id/repair/complete",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.completeRepair)
);

mechanicRouter.get(
  "/emergency-requests/:id/service-report",
  auth,
  authorizeRoles("mechanic"),
  asyncHandler(emergencyWorkflowController.getServiceReport)
);
mechanicRouter.patch(
    "/service-location",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(
        mechanicApplicationController.updateServiceLocation
    )
);

export default mechanicRouter;
