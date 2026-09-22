import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IGetUserUseCase } from "../../../application/interfaces/admin/IGetUserUseCase.js";
import { IAdminUserController } from "../../interfaces/admin/IAdminController.js";
import { Request , Response } from "express";

export class AdminController implements IAdminUserController{
    constructor(private  getUserUseCase : IGetUserUseCase){}
  getUsers = async (req: Request , res:Response): Promise<void> => {
     const users = await this.getUserUseCase.execute();
     res.status(HttpStatusCode.OK).json({
        success : true,
        data : users
     })
 }
}