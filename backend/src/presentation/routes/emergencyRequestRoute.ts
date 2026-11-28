import { Router } from "express";
import {
    auth,
    emergencyImageUploadController,
    emergencyRequestStatusController,
    emergencyWorkflowController,
    razorpayWebhookController,
} from "../../di/container.js";

import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
import { uploadEmergencyImages } from "../middlewares/UploadEmergencyImages.js";
import { CreateEmergencyRequestController } from "../controllers/EmergencyRequestController.js";

export function createEmergencyRequestRouter(
    createEmergencyRequestController: CreateEmergencyRequestController
) {
    const emergencyRouter = Router();

    // Shared Razorpay webhook alias for emergency estimates
    emergencyRouter.post(
        "/webhook/razorpay",
        asyncHandler(razorpayWebhookController.handle)
    );

    // Authenticated WebRTC STUN/TURN configuration
    emergencyRouter.get(
        "/rtc-config",
        auth,
        authorizeRoles("user", "mechanic"),
        asyncHandler(emergencyWorkflowController.getRtcConfig)
    );

    // Create emergency request
    emergencyRouter.post(
        '/',
        auth,
        authorizeRoles("user"),
        asyncHandler(createEmergencyRequestController.handle)
    );

    emergencyRouter.post(
        '/images',
        auth,
        authorizeRoles("user"),
        uploadEmergencyImages.array("images", 5),
        asyncHandler(emergencyImageUploadController.handle)
    );

    emergencyRouter.get(
        '/my-requests',
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyRequestStatusController.getUserRequests)
    );

    emergencyRouter.get(
        '/my-active-request',
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyRequestStatusController.getActiveRequest)
    );

    emergencyRouter.post(
        "/:id/cancel",
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyWorkflowController.cancelRequest)
    );

    emergencyRouter.post(
        "/:id/estimates/:estimateId/approve",
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyWorkflowController.approveEstimate)
    );

    emergencyRouter.post(
        "/:id/estimates/:estimateId/reject",
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyWorkflowController.rejectEstimate)
    );

    emergencyRouter.post(
        "/:id/payment-order",
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyWorkflowController.createPaymentOrder)
    );

    emergencyRouter.post(
        "/:id/verify-payment",
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyWorkflowController.verifyPayment)
    );

    emergencyRouter.get(
        "/:id/service-report",
        auth,
        authorizeRoles("user", "mechanic"),
        asyncHandler(emergencyWorkflowController.getServiceReport)
    );

    emergencyRouter.get(
        '/:id',
        auth,
        authorizeRoles("user"),
        asyncHandler(emergencyRequestStatusController.getRequestStatus)
    );

    return emergencyRouter;
}