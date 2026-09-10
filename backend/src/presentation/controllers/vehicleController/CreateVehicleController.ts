import { Request, Response } from "express";
import { ICreateVehicleController } from "../../interfaces/ICreateVehicleController.js";
import { VehicleDto } from "../../../application/dtos/vehicle.js";
import { ICreateVehicleUseCase } from "../../../application/interfaces/vehicle/ICreateVehicle.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IGetVehicleUseCase } from "../../../application/interfaces/vehicle/IGetVehicle.js";
import { IGetVehicleBYIdUseCase } from "../../../application/interfaces/vehicle/IGetvehicleByid.js";

export class CreateVehicleController implements ICreateVehicleController {
   constructor(private createVehicleUseCase: ICreateVehicleUseCase, private getVehicleUseCase : IGetVehicleUseCase, private getvehiclebyIdUseCase : IGetVehicleBYIdUseCase) {}
   createVehilce = async (req: Request, res: Response): Promise<void> => {
      const vehilceDto: VehicleDto = req.body
      const userId = req.user!.userId;
      const vehicle = await this.createVehicleUseCase.execute(vehilceDto, userId)
      res.status(HttpStatusCode.CREATED).json({
         succes: true,
         message: "Vehicle create succesfully",
         data: vehicle
      })
   }
   getVehilce = async (req: Request, res: Response): Promise<void> => {
     const userId = req.user!.userId
     const findvehicle =  await this.getVehicleUseCase.getVehicle(userId)
     console.log('this is the findvehile',findvehicle)
     
     res.status(HttpStatusCode.OK).json({
      succes : true,
      message:"your vehicles",
      vehicles : findvehicle
     })

   }

   getVehicleusingById = async(req: Request<{vehicleId : string }>, res: Response): Promise<void> => {
      const vehicleId = req.params.vehicleId
      const getvehiclebyId =  await this.getvehiclebyIdUseCase.getVehicleById(vehicleId)
      res.status(HttpStatusCode.OK).json({
         succes:true,
         getvehiclebyId
      })
   }
}