import { Router } from "express";
import { createVehicleController } from "../../di/container.js";
import { auth } from "../../di/container.js";

const vehilceRouter = Router()

vehilceRouter.post('/create',auth,createVehicleController.createVehilce )

vehilceRouter.get('/getvehicles' , auth ,createVehicleController.getVehilce )

vehilceRouter.get('/:vehicleId' , auth ,createVehicleController.getVehicleusingById )

vehilceRouter.patch('/:vehicleId' , auth , createVehicleController.updateVehicleById )

vehilceRouter.delete('/:vehicleId' , auth , createVehicleController.removeVehicleById )

export default vehilceRouter

