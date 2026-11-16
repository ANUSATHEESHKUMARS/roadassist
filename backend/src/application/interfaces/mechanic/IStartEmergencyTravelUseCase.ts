import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";

export interface IStartEmergencyTravelUseCase{
    execute(requestId:string, mechanicId:string):Promise<EmergencyRequest>
}