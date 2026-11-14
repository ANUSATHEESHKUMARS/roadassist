import { Router } from "express";
import {
    auth,
    emergencyImageUploadController,
    emergencyRequestStatusController
} from "../../di/container.js";

import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadEmergencyImages } from "../middlewares/UploadEmergencyImages.js";
import { CreateEmergencyRequestController } from "../controllers/EmergencyRequestController.js";

export function createEmergencyRequestRouter(
    createEmergencyRequestController: CreateEmergencyRequestController
) {
    const emergencyRouter = Router();

    // Create emergency request
    emergencyRouter.post(
        '/',
        auth,
        asyncHandler(createEmergencyRequestController.handle)
    );

    // Upload emergency images
    emergencyRouter.post(
        '/images',
        auth,
        uploadEmergencyImages.array("images", 5),
        asyncHandler(emergencyImageUploadController.handle)
    );

    // User-side status endpoints
    emergencyRouter.get(
        '/my-requests',
        auth,
        asyncHandler(emergencyRequestStatusController.getUserRequests)
    );

    emergencyRouter.get(
        '/:id',
        auth,
        asyncHandler(emergencyRequestStatusController.getRequestStatus)
    );

    return emergencyRouter;
}