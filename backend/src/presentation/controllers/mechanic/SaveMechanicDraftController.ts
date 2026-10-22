
import { Request, Response } from "express";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { SaveMechanicApplicationDraftDto } from "../../../application/dtos/mechanic/SavemechanicApplicationDraftDto.js";
import { ISubmitMechanicApplicationUseCase } from "../../../application/interfaces/mechanic/ISubmitMechanicApplicationUseCase.js";
import { ISaveMechanicApplicationDraftUseCase } from "../../../application/interfaces/mechanic/ISaveMechanicApplicationDraftUseCase.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";


export class MechanicApplicationController {
    constructor(
        private readonly saveMechanicDraftUseCase: ISaveMechanicApplicationDraftUseCase,
        private readonly submitMechanicApplicationUseCase: ISubmitMechanicApplicationUseCase
    ) { }

    saveDraft = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId

        if (!userId) {

            const response : CommonResponse = {
                success:false,
                message:"Authentication required"
            }
            res.status(HttpStatusCode.UNAUTHORIZED).json(response)
            return;
        }

        const dto = req.body as SaveMechanicApplicationDraftDto;

        const application = await this.saveMechanicDraftUseCase.execute(
            userId,
            dto
        );

      const response : CommonResponse <typeof application>= {
        success:true,
        message:"Mechanic applicatin draft saved succesfullyy"
      }
      res.status(HttpStatusCode.OK).json(response)
    }
    submitApplication = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId
        if (!userId) {
         const response:CommonResponse = {
            success:false,
            message:"Authentication required"
         }
         res.status(HttpStatusCode.UNAUTHORIZED).json(response)
            return
        }
        const application = await this.submitMechanicApplicationUseCase.execute(userId)
           const response: CommonResponse<typeof application> = {
            success: true,
            message: "Mechanic application submitted successfully",
            data: application,
        };
        res.status(HttpStatusCode.OK).json(response)
    }

}
