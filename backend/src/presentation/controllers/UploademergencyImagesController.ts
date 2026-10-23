import { Request, Response } from "express";
import { IUploadEmergencyRequestUploadUseCase } from "../../application/interfaces/IUploadEmergencyImagesUseCase.js";
import { CommonResponse } from "../../shared/types/CommonResponse.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";

export class UploadEmergencyImagesController {
    constructor(private emergencyImageUploadUseCase: IUploadEmergencyRequestUploadUseCase) { }
    handle = async (req: Request, res: Response): Promise<void> =>{
        const userId = req.user?.userId
        if(!userId){
            const response : CommonResponse = {
                success : false,
                message:"Authencticatio required to procced"
            }
            res.status(HttpStatusCode.BAD_REQUEST).json(response)
            return
        }
        const files = req.files;
        if(!Array.isArray(files) || files.length === 0){
            const response : CommonResponse = {
                success :false,
                message:"At least one image is required"
            }
            res.status(HttpStatusCode.BAD_REQUEST).json(response)
            return
        }
        const images = await this.emergencyImageUploadUseCase.execute(userId,files)

        const response : CommonResponse<{issueImages :string[]}> = {
            success : true,
            message : "Emergency image upload successfully",
            data:{
                issueImages : images
            }
        }
        res.status(HttpStatusCode.CREATED).json(response)
    }
}


