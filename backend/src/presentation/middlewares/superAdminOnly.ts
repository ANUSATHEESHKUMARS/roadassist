import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { Request , Response , NextFunction } from "express";

export const superAdminOnly = (
    req : Request ,
    res : Response,
    next : NextFunction
): void => {
    if(req.user?.activeRole !== "superadmin"){
        res.status(HttpStatusCode.CONFILCT).json({
            succes:false,
            message:"Super Admin acess required"
        })
        return
    }
    next()
}