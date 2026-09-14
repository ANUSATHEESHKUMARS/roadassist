import { Request , Response } from "express";

export interface IAuthController {
    register(req: Request , res:Response): Promise<void>;
    login(req : Request, res: Response): Promise<void>;
    googleLogin(req: Request , res : Response):Promise<void>
}