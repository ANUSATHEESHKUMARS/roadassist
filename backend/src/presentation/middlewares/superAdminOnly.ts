import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { Request , Response , NextFunction } from "express";

export const superAdminOnly = (
    req : Request ,
    res : Response,
    next : NextFunction
): void => {
    console.log(req.user , 'this is for checking everything')
    if(req.user?.role !== "superadmin"){
          console.log("SUPER ADMIN MIDDLEWARE ENTERED");

        res.status(HttpStatusCode.CONFILCT).json({
            succes:false,
            message:"Super Admin acess required"
        })
        return
    }
    next()
}