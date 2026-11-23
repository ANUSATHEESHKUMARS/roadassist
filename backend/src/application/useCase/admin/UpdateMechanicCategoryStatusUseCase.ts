import { MechanicCategory } from "../../../domain/User/entities/MechanicCategory.js";

import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";

import { IUpdateMechanicCategoryStatusUseCase } from "../../interfaces/admin/IUpdateMechanicCategoryStatusUseCase.js";

import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";

export class UpdateMechanicCategoryStatusUseCase
    implements IUpdateMechanicCategoryStatusUseCase {

    constructor(
        private readonly mechanicCategoryRepository: IMechanicCategoryRepository
    ) {}

    async execute(
        id: string,
        isActive: boolean
    ): Promise<MechanicCategory> {

        // 1. Validate category ID
        if (!id?.trim()) {
            throw new BadRequest("Category ID is required");
        }

        // 2. Validate status
        if (typeof isActive !== "boolean") {
            throw new BadRequest("isActive must be a boolean");
        }

        // 3. Check whether category exists
        const existingCategory =
            await this.mechanicCategoryRepository.findById(id);

        if (!existingCategory) {
            throw new NotfoundError("Mechanic category not found");
        }

        // 4. Update category status
        const updatedCategory =
            await this.mechanicCategoryRepository.updateStatus(
                id,
                isActive
            );

        if (!updatedCategory) {
            throw new NotfoundError("Mechanic category not found");
        }

        return updatedCategory;
    }
}