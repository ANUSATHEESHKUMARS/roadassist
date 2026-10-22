import { Router } from "express";
import { auth, createEmergencyRequestController } from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";

const emergencyRouter = Router()

emergencyRouter.post('/',auth,asyncHandler(createEmergencyRequestController.handle) )

export default emergencyRouter