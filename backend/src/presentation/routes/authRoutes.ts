import { Router } from "express";
import { IAuthController } from "../interfaces/IAuthController.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { IVerifyOtpController } from "../interfaces/IVerifyOtpController.js";

export default function createAuthRoutes(authcontroller : IAuthController, verifyotpcontroller : IVerifyOtpController){

const authRouter = Router();
    console.log("REGISTER ROUTE CREATED");

authRouter.post('/register', asyncHandler(authcontroller.register))
  
authRouter.post('/login', asyncHandler(authcontroller.login))

authRouter.post('/verifyotp' , asyncHandler(verifyotpcontroller.execute))

return authRouter

}





