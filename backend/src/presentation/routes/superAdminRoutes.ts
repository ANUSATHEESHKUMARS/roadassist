import { Router } from "express";
import { auth, superAdminController } from '../../di/container.js'
import { superAdminOnly } from "../middlewares/superAdminOnly.js";



const superadminRouter = Router()


superadminRouter.get('/admins',
    auth,
    superAdminOnly,
    superAdminController.getAdmins
)


export default superadminRouter;


