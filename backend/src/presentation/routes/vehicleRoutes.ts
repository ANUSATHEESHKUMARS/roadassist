import { Router } from "express";
import { createVehicleController } from "../../di/container.js";
import { auth } from "../../di/container.js";
import { upload } from "../middlewares/upload.js";

const vehilceRouter = Router()

// vehilceRouter.post('/create',auth,createVehicleController.createVehilce )

vehilceRouter.get('/getvehicles' , auth ,createVehicleController.getVehilce )

vehilceRouter.get('/:vehicleId' , auth ,createVehicleController.getVehicleusingById )

vehilceRouter.patch('/:vehicleId' , auth ,  upload.fields([
        { name: "vehicleImage", maxCount: 1 },
        { name: "insuranceCertificateImage", maxCount: 1 },
        { name: "pucCertificateImage", maxCount: 1 }
    ]),createVehicleController.updateVehicleById )

vehilceRouter.delete('/:vehicleId' , auth , createVehicleController.removeVehicleById )
vehilceRouter.post(
    "/create",
    auth,
    upload.fields([
        { name: "vehicleImage", maxCount: 1 },
        { name: "insuranceCertificateImage", maxCount: 1 },
        { name: "pucCertificateImage", maxCount: 1 }
    ]),
    createVehicleController.createVehilce
);
export default vehilceRouter

