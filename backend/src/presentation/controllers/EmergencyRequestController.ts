import { Request, Response } from "express";
import { CommonResponse } from "../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { ICreateEmergencyRequestUseCase } from "../../application/interfaces/IEmergencyRequestUseCase.js";
export class CreateEmergencyRequestController {
    constructor(private readonly createEmergencyRequestUseCase: ICreateEmergencyRequestUseCase) { }
    handle = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId
        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Unauthorized please log in."
            }
            res.status(HttpStatusCode.BAD_REQUEST).json(response)
            return
        }
        const { vehicleId, location, emergencyIssueCategory  , issueTitle  , issueDescription , issueImages} = req.body

        console.log("Vehicle ID after destructuring:", vehicleId);

        const emergencyRequest = await this.createEmergencyRequestUseCase.execute(userId, {
            vehicleId,
            location,
            emergencyIssueCategory,
            issueTitle,
            issueDescription,
            issueImages
        })
        const response: CommonResponse<typeof emergencyRequest> = {
            success: true,
            message: "Emergency request created successfully",
            data: emergencyRequest
        }
        res.status(HttpStatusCode.CREATED).json(response)
        return
    }
}