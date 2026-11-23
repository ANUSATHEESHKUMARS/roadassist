import { CreateMechanicCategoryDto } from "../../application/dtos/mechanic-category/CreateMechanicCategoryDto.js";
import { ICreateMechanicCategoryUseCase } from "../../domain/repositories/admin/ICreateMechanicCategoryUseCase.js";
import { IMechanicCategoryRepository } from "../../domain/repositories/admin/IMechanicCategoryRepository.js";
import { MechanicCategory } from "../../domain/User/entities/MechanicCategory.js";
import { BadRequest } from "../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../shared/errors/ConflitError.js";


export class CreateMechanicCategoryUseCase
    implements ICreateMechanicCategoryUseCase {

    constructor(
        private readonly mechanicCategoryRepository:
            IMechanicCategoryRepository
    ) { }


    async execute(
        dto: CreateMechanicCategoryDto
    ): Promise<MechanicCategory> {


        const name = dto.name?.trim();

        if (!name) {
            throw new BadRequest(
                "Category name is required",
                "CATEGORY_NAME_REQUIRED"
            );
        }



        const slug = dto.slug?.trim().toLowerCase();

        if (!slug) {
            throw new BadRequest(
                "Category slug is required",
                "CATEGORY_SLUG_REQUIRED"
            );
        }



        const existingCategory =
            await this.mechanicCategoryRepository.findBySlug(slug);

        if (existingCategory) {
            throw new ConflictError(
                "Category already exists",
                "CATEGORY_ALREADY_EXISTS"
            );
        }



        const subcategories = dto.subcategories ?? [];

        const subcategorySlugs = new Set<string>();

        const formattedSubcategories = subcategories.map(subcategory => {

            const subcategoryName = subcategory.name?.trim();

            const subcategorySlug =
                subcategory.slug?.trim().toLowerCase();

            if (!subcategoryName || !subcategorySlug) {
                throw new BadRequest(
                    "Subcategory name and slug are required",
                    "INVALID_SUBCATEGORY"
                );
            }

            if (subcategorySlugs.has(subcategorySlug)) {
                throw new ConflictError(
                    "Duplicate subcategory slug",
                    "DUPLICATE_SUBCATEGORY_SLUG"
                );
            }

            subcategorySlugs.add(subcategorySlug);

            return {
                name: subcategoryName,
                slug: subcategorySlug,

                ...(subcategory.description?.trim() && {
                    description: subcategory.description.trim()
                }),

                isActive: true
            };

        });



        const category = new MechanicCategory({

            name,
            slug,

            ...(dto.description?.trim() && {
                description: dto.description.trim()
            }),

            subcategories: formattedSubcategories,

            isActive: true

        });


        // 6. Save category in database

        try {

            const savedCategory =
                await this.mechanicCategoryRepository.create(category);

            return savedCategory;

        } catch (error: unknown) {

            // MongoDB duplicate key error

            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === 11000
            ) {
                throw new ConflictError(
                    "Category already exists",
                    "CATEGORY_ALREADY_EXISTS"
                );
            }

            throw error;
        }

    }
}
