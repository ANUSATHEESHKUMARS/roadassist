
import {
    MechanicCategory,
    MechanicSubcategory
} from "../../../domain/User/entities/MechanicCategory.js";

import { IMechanicCategoryRepository } from "../../../domain/repositories/admin/IMechanicCategoryRepository.js";

import { CreateMechanicCategoryDto } from "../../dtos/mechanic-category/CreateMechanicCategoryDto.js";

import { ICreateMechanicCategoryUseCase } from "../../interfaces/admin/ICreateMechanicCategoryUseCase.js";

import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";

export class CreateMechanicCategoryUseCase
    implements ICreateMechanicCategoryUseCase {

    constructor(
        private readonly mechanicCategoryRepository: IMechanicCategoryRepository
    ) {}

    async execute(dto: CreateMechanicCategoryDto): Promise<MechanicCategory> {

        // 1. Validate category name
        const name = dto.name?.trim();

        if (!name) {
            throw new BadRequest("Category name is required");
        }

        // 2. Validate category slug
        const slug = dto.slug?.trim().toLowerCase();

        if (!slug) {
            throw new BadRequest("Category slug is required");
        }

        // 3. Check duplicate category slug
        const existingCategory =
            await this.mechanicCategoryRepository.findBySlug(slug);

        if (existingCategory) {
            throw new ConflictError("Category slug already exists");
        }

        // 4. Process subcategories
        const subcategories = dto.subcategories ?? [];

        const processedSubcategories: MechanicSubcategory[] =
            subcategories.map((subcategory) => {

                const subcategoryName = subcategory.name?.trim();
                const subcategorySlug = subcategory.slug?.trim().toLowerCase();
                const description = subcategory.description?.trim();

                if (!subcategoryName) {
                    throw new BadRequest("Subcategory name is required");
                }

                if (!subcategorySlug) {
                    throw new BadRequest("Subcategory slug is required");
                }

                return {
                    name: subcategoryName,
                    slug: subcategorySlug,
                    isActive: true,
                    ...(description ? { description } : {})
                };
            });

        // 5. Check duplicate subcategory slugs
        const subcategorySlugs = processedSubcategories.map(
            (subcategory) => subcategory.slug
        );

        if (new Set(subcategorySlugs).size !== subcategorySlugs.length) {
            throw new ConflictError("Duplicate subcategory slug found");
        }

        // 6. Prepare category description
        const description = dto.description?.trim();

        // 7. Create domain entity
        const category = new MechanicCategory({
            name,
            slug,
            subcategories: processedSubcategories,
            isActive: true,
            ...(description ? { description } : {})
        });

        // 8. Save category
        try {
            return await this.mechanicCategoryRepository.create(category);

        } catch (error: unknown) {

            // Handle MongoDB duplicate key error
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                throw new ConflictError("Category slug already exists");
            }

            throw error;
        }
    }
}
