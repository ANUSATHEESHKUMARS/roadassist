import { Router } from 'express'
import { IAuthController } from '../interfaces/IAuthController.js'
import createAuthRoutes from './authRoutes.js'
import { IVerifyOtpController } from '../interfaces/IVerifyOtpController.js'


export default function createRoutes(authcontroller : IAuthController, verifyotpcontroller : IVerifyOtpController){
    const router = Router()
    const authRoutes = createAuthRoutes(authcontroller,verifyotpcontroller )
    
    router.use('/auth',authRoutes)
    return router
}




