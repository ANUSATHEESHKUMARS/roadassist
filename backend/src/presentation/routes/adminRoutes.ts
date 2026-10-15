import { Router } from "express";
import { adminController, auth ,uploadMediaController} from "../../di/container.js";
import { authorizeRoles } from "../middlewares/authorizationMiddleware.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { uploadMedia } from "../middlewares/uploadMedia.js";

const adminRouter = Router()

adminRouter.get("/users" , auth , authorizeRoles("admin"),asyncHandler(adminController.getUsers))

adminRouter.post('/media/upload', auth , authorizeRoles('admin'), uploadMedia.single('file'), asyncHandler(uploadMediaController.handle))


adminRouter.get('/media',auth , authorizeRoles('admin'),asyncHandler(uploadMediaController.handleGet))

adminRouter.delete('/media/:id' , auth, authorizeRoles("admin") , asyncHandler(uploadMediaController.handleDelete))

export default adminRouter

