import { Request, Response } from "express";
import { ICreateVehicleController } from "../../interfaces/ICreateVehicleController.js";
import { VehicleDto } from "../../../application/dtos/vehicle.js";
import { ICreateVehicleUseCase } from "../../../application/interfaces/vehicle/ICreateVehicle.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { IGetVehicleUseCase } from "../../../application/interfaces/vehicle/IGetVehicle.js";
import { IGetVehicleBYIdUseCase } from "../../../application/interfaces/vehicle/IGetvehicleByid.js";
import { UpdateVehicleDto } from "../../../application/dtos/updateVehicleDto.js";
import { IUpdateVehicelUseCase } from "../../../application/interfaces/vehicle/IUpdateVehicleUsecase.js";
import { IRemoveVehicleUseCase } from "../../../application/interfaces/vehicle/IRemoveVehicle.js";

export class CreateVehicleController implements ICreateVehicleController {

   constructor(private createVehicleUseCase: ICreateVehicleUseCase,
      private getVehicleUseCase: IGetVehicleUseCase,
      private getvehiclebyIdUseCase: IGetVehicleBYIdUseCase,
      private updateVehicleUseCase: IUpdateVehicelUseCase,
      private removeVehicleUseCase : IRemoveVehicleUseCase) {}

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
    

      const findvehicle = await this.getVehicleUseCase.getVehicle(userId)
      res.status(HttpStatusCode.OK).json({
         succes: true,
         message: "your vehicles",
         vehicles: findvehicle
      })

   }

   getVehicleusingById = async (req: Request<{ vehicleId: string }>, res: Response): Promise<void> => {

      const vehicleId = req.params.vehicleId
      const getvehiclebyId = await this.getvehiclebyIdUseCase.getVehicleById(vehicleId)
      console.log("4dsf",getvehiclebyId)
      res.status(HttpStatusCode.OK).json({
         succes: true,
         getvehiclebyId
      })
   }

   updateVehicleById = async (req: Request<{ vehicleId: string }>, res: Response): Promise<void> => {
      const vehicleId = req.params.vehicleId
      const userId = req.user!.userId
      const dataToUpdate: UpdateVehicleDto = req.body
      const change = await this.updateVehicleUseCase.updateVehicele(vehicleId, userId, dataToUpdate)
      res.status(HttpStatusCode.OK).json({
         message: "vehicle details updated",
         succes: true,
         data: change
      })
   }
   removeVehicleById = async(req: Request<{vehicleId : string}>, res: Response): Promise<void> => {
      const userId = req.user!.userId;
      const vehicleId = req.params.vehicleId
      const deletevehicle = await this.removeVehicleUseCase.deleteById(vehicleId , userId)
      res.status(HttpStatusCode.OK).json({
         message : "vehicle removed succesfuly",
         succes : true,
         deletevehicle
         
      })
   }
}


