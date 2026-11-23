import { MechanicCategory } from "../../../domain/User/entities/MechanicCategory.js";

import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";

import { IGetMechanicCategoriesUseCase } from "../../interfaces/admin/IGetMechanicCategoriesUseCase.js";

export class GetMechanicCategoriesUseCase
    implements IGetMechanicCategoriesUseCase {

    constructor(
        private readonly mechanicCategoryRepository: IMechanicCategoryRepository
    ) {}

    async execute(includeInactive = false): Promise<MechanicCategory[]> {

        const categories =
            await this.mechanicCategoryRepository.findAll(includeInactive);

        return categories;
    }
}