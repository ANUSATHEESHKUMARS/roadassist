import { Router } from "express";
import { IAuthController } from "../interfaces/IAuthController.js";
import { asyncHandler } from "../../shared/helper/asyncHandler.js";
import { IVerifyOtpController } from "../interfaces/IVerifyOtpController.js";
import { auth } from '../../di/container.js'

export default function createAuthRoutes(
    authcontroller: IAuthController,
    verifyotpcontroller: IVerifyOtpController
) {

    const authRouter = Router();

    authRouter.post('/register', asyncHandler(authcontroller.register))

    authRouter.post('/login', asyncHandler(authcontroller.login))

    authRouter.post('/verifyotp', asyncHandler(verifyotpcontroller.execute))

    authRouter.post('/google', asyncHandler(authcontroller.googleLogin))

    authRouter.post('/resend', asyncHandler(authcontroller.resentOtp))

    authRouter.get('/me', auth, asyncHandler(authcontroller.getCurrentUser))

    authRouter.post('/logout', asyncHandler(authcontroller.logout))

    authRouter.post('/refresh', asyncHandler(authcontroller.refreshToken))
    
    return authRouter

}





