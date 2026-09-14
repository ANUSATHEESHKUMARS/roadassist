import { Request , Response } from "express"
export interface IAdminUserController{
    getUsers(req:Request , res  : Response):Promise<void>
}