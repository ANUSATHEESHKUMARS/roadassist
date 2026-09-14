import { Router } from "express";
import { adminController, auth } from "../../di/container.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";

const adminRouter = Router()

adminRouter.get("/users" , auth , authorizeRoles("admin"),asyncHandler(adminController.getUsers))

export default adminRouter