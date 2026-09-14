import { Request, Response , NextFunction } from "express";
import { ForbiddenError } from "../../shared/errors/ForbiddenError.js";


export const authorizeRoles = (...allowRoles: string[]) =>{
    return (req : Request , res : Response , next:NextFunction) : void =>{
        if(!req.user){
            next(new ForbiddenError("User role information is missing","ROLE_NOT_FOUND"))
            return
        }
        if(!allowRoles.includes(req.user.role)){
            next(new ForbiddenError("you do not have permission to acces this resourse","FORBIDDEN"))
            return 
        }
        next()
    }
}