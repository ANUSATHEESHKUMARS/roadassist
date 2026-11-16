import { Router } from "express";

import { auth, mechanicScheduleController } from "../../di/container.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
const scheduleRouter = Router();

scheduleRouter.post(
    "/create",
    auth,
    authorizeRoles("mechanic"),
    mechanicScheduleController.createSchedule
);

scheduleRouter.get(
    "/",
    auth,
    authorizeRoles("mechanic"),
    mechanicScheduleController.getSchedule
);

scheduleRouter.patch(
    "/update",
    auth,
    authorizeRoles("mechanic"), 
    mechanicScheduleController.updateSchedule
);

export default scheduleRouter;