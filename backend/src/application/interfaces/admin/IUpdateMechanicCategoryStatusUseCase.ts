import { MechanicCategory } from "../../../domain/User/entities/MechanicCategory.js";

export interface IUpdateMechanicCategoryStatusUseCase {
    execute(
        id: string,
        isActive: boolean
    ): Promise<MechanicCategory>;
}