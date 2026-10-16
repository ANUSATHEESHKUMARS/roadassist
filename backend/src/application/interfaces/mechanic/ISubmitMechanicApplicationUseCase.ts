import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";

export interface ISubmitMechanicApplicationUseCase {
    execute(userId : string,
    ):Promise<MechanicApplication>
}