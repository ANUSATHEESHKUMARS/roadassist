import { MechanicApplication } from "../../domain/User/entities/MechanicApplication.js";

export interface IApproveMechanicApplicationUseCase {
    execute(appliationId:string,
        adminId:string
    ):Promise<MechanicApplication>
}