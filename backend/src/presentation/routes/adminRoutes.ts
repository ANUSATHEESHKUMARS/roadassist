import { Router } from "express";
import { adminController, auth ,uploadMediaController} from "../../di/container.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadMedia } from "../middlewares/uploadMedia.js";

const adminRouter = Router()

adminRouter.get("/users" , auth , authorizeRoles("admin"),asyncHandler(adminController.getUsers))

adminRouter.patch('/users/:userId/block', auth, authorizeRoles('admin'), asyncHandler(adminController.blockUser))

adminRouter.patch("/user/:useId/unblock", auth, authorizeRoles('admin'), asyncHandler(adminController.unblockUser))

adminRouter.post('/media/upload', auth , authorizeRoles('admin'), uploadMedia.single('file'), asyncHandler(uploadMediaController.handle))

adminRouter.get('/media',auth , authorizeRoles('admin'),asyncHandler(uploadMediaController.handleGet))

adminRouter.delete('/media/:id' , auth, authorizeRoles("admin") , asyncHandler(uploadMediaController.handleDelete))

adminRouter.get('/mechanic-applications' , auth, authorizeRoles("admin"), asyncHandler(adminController.getMechanicApplication))

export default adminRouter

