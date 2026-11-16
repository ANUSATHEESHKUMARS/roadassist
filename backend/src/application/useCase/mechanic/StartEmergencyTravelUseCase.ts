import { IEmergencyRequestRepository } from "../../../domain/repositories/IEmergencyRequestRepository.js";
import { EmergencyRequest } from "../../../domain/User/entities/EmergencyRequest.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IStartEmergencyTravelUseCase } from "../../interfaces/mechanic/IStartEmergencyTravelUseCase.js";

export class StartEmergencyTravelUseCase implements IStartEmergencyTravelUseCase{
    constructor(private readonly emergencyRequestRepository: IEmergencyRequestRepository){}

   async execute(requestId: string, mechanicId: string): Promise<EmergencyRequest> {
        if(!requestId || !requestId.trim()){
            throw new BadRequest("Request id is required", "REQUEST_ID_REQUIRED")
        }
        if(!mechanicId || !mechanicId.trim()){
            throw new BadRequest("Mechanic id is required","MECHANIC_ID_IS_REQUIRED")
        }
        const existingRequest = await this.emergencyRequestRepository.findById(requestId)
        if(!existingRequest){
            throw new NotfoundError("Emergency request not found","EMERGENCY_REQUEST_NOTFOUND")
        }
        if(existingRequest.assignedMechanicId !== mechanicId){
            throw new ConflictError("ur not assigened to this emergney request","NOT_ASSIGENED_TO_THIS_REQUIEST")
        }
      if (existingRequest.status !== "assigned") {
            throw new ConflictError(
                "Travel can only be started for an assigned request"
            );
        }
     const updatedRequest = await this.emergencyRequestRepository.updateAssignedRequestStatus(requestId,mechanicId, "assigned" , "on_the_way")

       if (!updatedRequest) {
            throw new ConflictError(
                "Unable to start travel. The request status may have changed."
            );
        }
return updatedRequest
    }
}