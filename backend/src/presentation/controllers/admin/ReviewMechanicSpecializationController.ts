import { Request, Response, NextFunction } from "express";

import { IReviewMechanicSpecializationUseCase } from "../../../application/interfaces/admin/IReviewMechanicSpecializationUseCase.js";
import { MechanicApplicationMapper } from "../../../application/mappers/MechanicApplicationMapper.js";

import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
export class ReviewMechanicSpecializationController {

    constructor(
        private readonly reviewMechanicSpecializationUseCase: IReviewMechanicSpecializationUseCase
    ) { }


    execute = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {

        try {


            const applicationId = req.params.applicationId;
            const categoryId = req.params.categoryId;
            const subcategoryId = req.params.subcategoryId;




            if (
                typeof applicationId !== "string" ||
                typeof categoryId !== "string" ||
                typeof subcategoryId !== "string" ||
                !applicationId.trim() ||
                !categoryId.trim() ||
                !subcategoryId.trim()
            ) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Valid application, category and subcategory IDs are required"
                });
                return;
            }

            const adminId = req.user?.userId;

            if (!adminId) {
                res.status(401).json({
                    success: false,
                    message: "Admin authentication required"
                });
                return;
            }

            if (
                !req.body ||
                typeof req.body !== "object" ||
                Array.isArray(req.body)
            ) {
                res.status(HttpStatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Invalid request body"
                });
                return;
            }

            const { decision, rejectionReason } = req.body;

            const updatedApplication =
                await this.reviewMechanicSpecializationUseCase.execute(
                    applicationId,
                    categoryId,
                    subcategoryId,
                    adminId,
                    {
                        decision,
                        ...(rejectionReason !== undefined && {
                            rejectionReason
                        })
                    }
                );


            // 5. Send response

            res.status(200).json({
                success: true,
                message: `Specialization ${decision} successfully`,
                data: MechanicApplicationMapper.toResponse(
                    updatedApplication
                )
            });

        } catch (error) {
            next(error);
        }
    }
}