import { Router } from 'express'
import { IAuthController } from '../interfaces/IAuthController.js'
import createAuthRoutes from './authRoutes.js'

export default function createRoutes(authcontroller : IAuthController){
    const router = Router()
    const authRoutes = createAuthRoutes(authcontroller)
    router.use('/auth',authRoutes)
    return router
}




