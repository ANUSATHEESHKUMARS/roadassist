import { MechanicCategory } from "../../../domain/User/entities/MechanicCategory.js";

import { UpdateMechanicCategoryDto } from "../../dtos/admin/UpdateMechanicCategoryDto.js";
export interface IUpdateMechanicCategoryUseCase {
    execute(
        id: string,
        dto: UpdateMechanicCategoryDto
    ): Promise<MechanicCategory>;
}