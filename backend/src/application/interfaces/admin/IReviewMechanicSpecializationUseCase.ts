import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";

import { ReviewMechanicSpecializationDto } from "../../dtos/admin/RevierwMechanicSpecialization.js";
export interface IReviewMechanicSpecializationUseCase {
    execute(
        applicationId: string,
        categoryId: string,
        subcategoryId: string,
        adminId: string,
        dto: ReviewMechanicSpecializationDto
    ): Promise<MechanicApplication>;
}