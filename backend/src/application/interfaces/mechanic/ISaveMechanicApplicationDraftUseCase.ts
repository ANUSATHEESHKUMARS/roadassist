import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { SaveMechanicApplicationDraftDto } from "../../dtos/mechanic/SavemechanicApplicationDraftDto.js";

export interface ISaveMechanicApplicationDraftUseCase {
    execute(userId:string ,
        dto:SaveMechanicApplicationDraftDto
    ):Promise<MechanicApplication>
}