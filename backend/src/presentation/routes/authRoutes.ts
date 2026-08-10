import { Router } from "express";
import { IAuthController } from "../interfaces/IAuthController.js";


export default function createAuthRoutes(authcontroller : IAuthController){
    const authRouter = Router();

    authRouter.post('/register', (req , res ) =>{
        void authcontroller.register(req , res);
    })
return authRouter
}

