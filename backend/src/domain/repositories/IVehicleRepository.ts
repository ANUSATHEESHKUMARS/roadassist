import { Vehicle } from "../vehilce/Vehilce.js";

export interface IVehicleRepository {
    create(vehilce:Vehicle):Promise<Vehicle>
    findByUserId(userId : string):Promise<Vehicle[]>
    findById(vehicleId:string):Promise<Vehicle | null>
    update(vehicleId : string , vehicle : Partial<Vehicle>):Promise<Vehicle|null>
    delete(vehicleId: string):Promise<boolean>
}