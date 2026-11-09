import { Router } from "express";
import { auth, createEmergencyRequestController, emergencyImageUploadController, emergencyRequestStatusController } from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadEmergencyImages } from "../middlewares/UploadEmergencyImages.js";

const emergencyRouter = Router()

emergencyRouter.post('/', auth, asyncHandler(createEmergencyRequestController.handle))

emergencyRouter.post('/images', auth, uploadEmergencyImages.array("images", 5), asyncHandler(emergencyImageUploadController.handle))

// ─── User-side status endpoints ─────────────────────────────────────────────

emergencyRouter.get('/my-requests', auth, asyncHandler(emergencyRequestStatusController.getUserRequests))

emergencyRouter.get('/:id', auth, asyncHandler(emergencyRequestStatusController.getRequestStatus))

export default emergencyRouter
