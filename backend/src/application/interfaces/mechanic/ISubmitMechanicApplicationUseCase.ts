import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { SubmitMechanicApplicationDto } from "../../dtos/mechanic/SubmitMechanicApplicationDto.js";

export interface ISubmitMechanicApplicationUseCase {
    execute(userId : string,
    ):Promise<MechanicApplication>
}