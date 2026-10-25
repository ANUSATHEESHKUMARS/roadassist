import { MechanicApplication } from "../../domain/User/entities/MechanicApplication.js";

export interface IRejectMechanicApplictionUseCase {
    execute(applicationId:string , adminId:string , rejectionReason:string):Promise<MechanicApplication>
}