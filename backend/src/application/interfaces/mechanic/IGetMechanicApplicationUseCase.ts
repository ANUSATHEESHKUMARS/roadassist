import { MechanicApplication, MechanicApplicationStatus } from "../../../domain/User/entities/MechanicApplication.js";

export interface IGetMechanicApplicationUseCase{
    execute(status:MechanicApplicationStatus):Promise<MechanicApplication[]>
}
