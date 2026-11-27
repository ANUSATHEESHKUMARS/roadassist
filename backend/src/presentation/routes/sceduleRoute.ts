import { Router } from "express";

import { auth, mechanicScheduleController } from "../../di/container.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
const scheduleRouter = Router();

scheduleRouter.post(
    "/create",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicScheduleController.createSchedule)
);

scheduleRouter.get(
    "/",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicScheduleController.getSchedule)
);

scheduleRouter.patch(
    "/update",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicScheduleController.updateSchedule)
);

scheduleRouter.put(
    "/date-availability",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicScheduleController.upsertDateAvailability)
);

scheduleRouter.delete(
    "/date-availability/:date",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicScheduleController.removeDateAvailability)
);

scheduleRouter.get(
    "/booked-dates",
    auth,
    authorizeRoles("mechanic"),
    asyncHandler(mechanicScheduleController.getBookedDates)
);

export default scheduleRouter;