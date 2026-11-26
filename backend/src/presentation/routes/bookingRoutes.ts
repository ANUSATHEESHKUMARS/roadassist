
import { Router } from "express";

import { auth, bookingController } from "../../di/container.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";

const bookingRouter = Router();

bookingRouter.post(
    "/scheduled",
    auth,
    authorizeRoles("user"),
    bookingController.createBooking
);

export default bookingRouter;
