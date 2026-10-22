import { ForbiddenError } from "../../shared/errors/ForbiddenError.js";
import { CreateEmergencyRequestDto } from "../dtos/CreateEmergencyRequest.js";
import { ICreateEmergencyRequestValidator } from "./interfaces/ICreateEmergencyRequestValidator.js";

export class CreateEmerencyRequestValidator implements ICreateEmergencyRequestValidator{
    validate(dto: CreateEmergencyRequestDto): void {
        if(!dto.vehicleId || !dto.vehicleId.trim()){
            throw new ForbiddenError("Vehicle Id is required","VEHICLE_ID_REQUIRED")
        }
        if(!dto.location){
            throw new ForbiddenError("Breakdown location is required",'LOCATION_REQUIRED')
        }
        const { latitude , longitude} = dto.location

        if(typeof latitude !== "number" || !Number.isFinite(latitude) || latitude <-90 || latitude >90){
           throw new ForbiddenError("Valid latitude is required",'LATITUDE_INCORRECT')
        }
        if(typeof longitude !== "number" || !Number.isFinite(longitude) || longitude <-180 || longitude > 180){
            throw new ForbiddenError('Valid longitude is required','LONGITUDE_INCORRECT')
        }
     if (
    typeof dto.issueDescription !== "string" ||
    dto.issueDescription.trim().length < 3 ||
    dto.issueDescription.trim().length > 1000
) {
    throw new ForbiddenError(
        "Issue description must be between 3 and 1000 characters",
        "DESCRIPTION_SHOULD_BE_PROPER"
    );
}
    }
}