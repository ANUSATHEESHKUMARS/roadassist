import {
    MechanicCategory,
    MechanicSubcategory
} from "../../../domain/User/entities/MechanicCategory.js";

import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";

import { UpdateMechanicCategoryDto } from "../../dtos/admin/UpdateMechanicCategoryDto.js";
import { IUpdateMechanicCategoryUseCase } from "../../interfaces/admin/IUpdateMechanicCategoryUseCase.js";

import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
export class UpdateMechanicCategoryUseCase
    implements IUpdateMechanicCategoryUseCase {

    constructor(
        private readonly mechanicCategoryRepository: IMechanicCategoryRepository
    ) {}

    async execute(
        id: string,
        dto: UpdateMechanicCategoryDto
    ): Promise<MechanicCategory> {

        // 1. Find existing category
        const existingCategory =
            await this.mechanicCategoryRepository.findById(id);

        if (!existingCategory) {
            throw new NotfoundError("Mechanic category not found");
        }

        // 2. Validate category name
        const name = dto.name?.trim();

        if (!name) {
            throw new BadRequest("Category name is required");
        }

        // 3. Validate category slug
        const slug = dto.slug?.trim().toLowerCase();

        if (!slug) {
            throw new BadRequest("Category slug is required");
        }

        // 4. Check whether the slug belongs to another category
        if (slug !== existingCategory.slug) {
            const categoryWithSlug =
                await this.mechanicCategoryRepository.findBySlug(slug);

            if (categoryWithSlug && categoryWithSlug.id !== id) {
                throw new ConflictError("Category slug already exists");
            }
        }

        // 5. Get existing subcategories
        const existingSubcategories = existingCategory.subcategories;

        const existingSubcategoryIds = new Set(
            existingSubcategories
                .map(subcategory => subcategory.id)
                .filter((subcategoryId): subcategoryId is string =>
                    Boolean(subcategoryId)
                )
        );

        // 6. Validate duplicate submitted IDs
        const submittedIds = dto.subcategories
            .map(subcategory => subcategory.id)
            .filter((subcategoryId): subcategoryId is string =>
                Boolean(subcategoryId)
            );

        if (new Set(submittedIds).size !== submittedIds.length) {
            throw new ConflictError("Duplicate subcategory ID found");
        }

        // 7. Validate that submitted IDs belong to this category
        for (const subcategory of dto.subcategories) {
            if (
                subcategory.id &&
                !existingSubcategoryIds.has(subcategory.id)
            ) {
                throw new BadRequest(
                    "Invalid subcategory ID for this category"
                );
            }
        }

        // 8. Process submitted subcategories
        const processedSubcategories: MechanicSubcategory[] =
            dto.subcategories.map(subcategory => {

                const subcategoryName = subcategory.name?.trim();
                const subcategorySlug =
                    subcategory.slug?.trim().toLowerCase();

                const description = subcategory.description?.trim();

                if (!subcategoryName) {
                    throw new BadRequest(
                        "Subcategory name is required"
                    );
                }

                if (!subcategorySlug) {
                    throw new BadRequest(
                        "Subcategory slug is required"
                    );
                }

                const existingSubcategory = subcategory.id
                    ? existingSubcategories.find(
                        item => item.id === subcategory.id
                    )
                    : undefined;

                return {
                    ...(subcategory.id ? { id: subcategory.id } : {}),
                    name: subcategoryName,
                    slug: subcategorySlug,
                    isActive: subcategory.isActive ?? true,
                    ...(description ? { description } : {})
                };
            });

        // 9. Deactivate existing subcategories omitted from the request
        const submittedIdSet = new Set(submittedIds);

        const removedSubcategories: MechanicSubcategory[] =
            existingSubcategories
                .filter(subcategory =>
                    subcategory.id &&
                    !submittedIdSet.has(subcategory.id)
                )
                .map(subcategory => ({
                    ...subcategory,
                    isActive: false
                }));

        const finalSubcategories = [
            ...processedSubcategories,
            ...removedSubcategories
        ];

        // 10. Check duplicate subcategory slugs
        const subcategorySlugs = finalSubcategories.map(
            subcategory => subcategory.slug
        );

        if (
            new Set(subcategorySlugs).size !==
            subcategorySlugs.length
        ) {
            throw new ConflictError(
                "Duplicate subcategory slug found"
            );
        }

        // 11. Handle category description
        const description =
            dto.description === undefined
                ? existingCategory.description
                : dto.description?.trim();

        // 12. Create updated domain entity
        const updatedCategory = new MechanicCategory({
            ...(existingCategory.id
                ? { id: existingCategory.id }
                : {}),
            name,
            slug,
            subcategories: finalSubcategories,
            isActive: existingCategory.isActive,
            ...(description ? { description } : {}),
            ...(existingCategory.createdAt
                ? { createdAt: existingCategory.createdAt }
                : {})
        });

        // 13. Persist updated category
        try {
            const updated =
                await this.mechanicCategoryRepository.update(
                    updatedCategory
                );

            if (!updated) {
                throw new NotfoundError("Mechanic category not found");
            }

            return updated;

        } catch (error: unknown) {

            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                throw new ConflictError(
                    "Category slug already exists"
                );
            }

            throw error;
        }
    }
}