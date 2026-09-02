import { Router } from "express";
import { IAuthController } from "../interfaces/IAuthController.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";


export default function createAuthRoutes(authcontroller : IAuthController){
    const authRouter = Router();

authRouter.post('/register', asyncHandler(authcontroller.register))
  
authRouter.post('/login', asyncHandler(authcontroller.login))
return authRouter
}





