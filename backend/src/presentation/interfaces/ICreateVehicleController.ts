import { Request , Response } from "express"
export interface ICreateVehicleController{
    createVehilce(req : Request , res : Response):Promise<void>
    getVehilce(req : Request , res : Response):Promise<void>
    getVehicleusingById(req:Request , res:Response):Promise<void>
    updateVehicleById(req:Request , res : Response): Promise<void>
    removeVehicleById(req:Request  , res : Response):Promise<void>
}