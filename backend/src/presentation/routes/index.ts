import { Router } from 'express'
import { IAuthController } from '../interfaces/IAuthController.js'
import createAuthRoutes from './authRoutes.js'
import { IVerifyOtpController } from '../interfaces/IVerifyOtpController.js'


export default function createRoutes(authcontroller : IAuthController, verifyotpcontroller : IVerifyOtpController){
    const router = Router()
    console.log("auth route created") 
    router.use('/auth',createAuthRoutes(authcontroller,verifyotpcontroller))
    return router
}






