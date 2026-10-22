import { CreateEmergencyRequestDto } from "../../dtos/CreateEmergencyRequest.js";

export interface ICreateEmergencyRequestValidator {
    validate(dto:CreateEmergencyRequestDto):void
}