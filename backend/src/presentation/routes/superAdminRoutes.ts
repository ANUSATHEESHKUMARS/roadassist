import { Router } from "express";
import { auth } from '../../di/container.js'
const superadminRouter = Router()


superadminRouter.get('/dashboard',
    auth,
    superadminRouter,
    (req, res) => {
        res.status(200).json({
            succes: true,
            message: "Super Admin dashboard acces granted"
        })
    }
)


export default superadminRouter