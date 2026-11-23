import { MechanicCategory } from "../../../domain/User/entities/MechanicCategory.js";

export interface IGetMechanicCategoriesUseCase {
    execute(includeInactive?: boolean): Promise<MechanicCategory[]>;
}