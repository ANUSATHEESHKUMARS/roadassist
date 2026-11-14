import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";

export interface IMechanicNotificationService{
    notifyNewEmergencyRequest(mechanicId:string, request:EmergencyRequest):Promise<void>
}