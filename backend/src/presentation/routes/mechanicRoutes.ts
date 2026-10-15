import { Router } from "express";
import { auth, mechanicApplicationController } from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";

const mechanicRouter = Router()

mechanicRouter.patch('/draft' ,auth, asyncHandler(mechanicApplicationController.saveDraft))
mechanicRouter.post('/submit', auth, asyncHandler(mechanicApplicationController.submitApplication))


export default mechanicRouter


