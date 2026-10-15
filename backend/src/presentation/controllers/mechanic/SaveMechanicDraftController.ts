
import { Request, Response } from "express";
import { SaveMechanicApplicationDraftDto } from "../../../application/dtos/mechanic/SavemechanicApplicationDraftDto.js";
import { ISubmitMechanicApplicationUseCase } from "../../../application/interfaces/mechanic/ISubmitMechanicApplicationUseCase.js";
import { ISaveMechanicApplicationDraftUseCase } from "../../../application/interfaces/mechanic/ISaveMechanicApplicationDraftUseCase.js";

export class MechanicApplicationController {
    constructor(
        private readonly saveMechanicDraftUseCase: ISaveMechanicApplicationDraftUseCase,
        private readonly submitMechanicApplicationUseCase: ISubmitMechanicApplicationUseCase
    ) { }

    saveDraft = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId

        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required",
            });
            return;
        }

        const dto = req.body as SaveMechanicApplicationDraftDto;

        const application = await this.saveMechanicDraftUseCase.execute(
            userId,
            dto
        );

        res.status(200).json({
            success: true,
            message: "Mechanic application draft saved successfully",
            data: application,
        });
    }
    submitApplication = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Authentication required"
            })
            return
        }
        const application = await this.submitMechanicApplicationUseCase.execute(userId)
        res.status(200).json({
            success: true,
            message: "Mechanic application submitted successfully",
            data: application,
        });
    }

}
