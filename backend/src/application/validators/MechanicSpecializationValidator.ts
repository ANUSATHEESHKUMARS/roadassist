import { IMechanicCategoryRepository }
    from "../../domain/repositories/admin/IMechanicCategoryRepository.js";

import { IMechanicSpecializationValidator } from "./interfaces/IMechanicSpecializationValidator.js";

import { MechanicSpecializationSelectionDto }
    from "../dtos/admin/MechanicSpecializationSelectionDto.js";

import { BadRequest }
    from "../../shared/errors/BadRequestError.js";

export class MechanicSpecializationValidator
    implements IMechanicSpecializationValidator {

    constructor(
        private readonly mechanicCategoryRepository: IMechanicCategoryRepository
    ) { }

    async validate(
        selections?: MechanicSpecializationSelectionDto[]
    ): Promise<void> {

        if (selections === undefined) return;

        for (const selection of selections) {

            const category =
                await this.mechanicCategoryRepository.findById(
                    selection.categoryId
                );

            if (!category) {
                throw new BadRequest(
                    "Selected category does not exist.",
                    "CATEGORY_NOT_FOUND"
                );
            }

            if (!category.isActive) {
                throw new BadRequest(
                    "Selected category is inactive.",
                    "CATEGORY_INACTIVE"
                );
            }

            for (const subcategoryId of selection.subcategoryIds) {

                const subcategory = category.subcategories.find(
                    item => item.id === subcategoryId
                );

                if (!subcategory) {
                    throw new BadRequest(
                        "Selected specialization does not belong to this category.",
                        "INVALID_SUBCATEGORY"
                    );
                }

                if (!subcategory.isActive) {
                    throw new BadRequest(
                        "Selected specialization is inactive.",
                        "SUBCATEGORY_INACTIVE"
                    );
                }
            }
        }
    }
}