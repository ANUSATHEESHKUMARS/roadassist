
import { MechanicCategory } from "../../domain/User/entities/MechanicCategory.js"

interface MechanicCategoryDocument {
    _id: { toString(): string };
    name: string;
    slug: string;
    description?: string;
    subcategories: {
        _id: { toString(): string };
        name: string;
        slug: string;
        description?: string;
        isActive: boolean;
    }[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export class MechanicCategoryMapper {

    static toEntity(document: MechanicCategoryDocument): MechanicCategory {
        return new MechanicCategory({
            id: document._id.toString(),
            name: document.name,
            slug: document.slug,

            ...(document.description != null
                ? { description: document.description }
                : {}),

            subcategories: document.subcategories.map(subcategory => ({
                id: subcategory._id.toString(),
                name: subcategory.name,
                slug: subcategory.slug,

                ...(subcategory.description != null
                    ? { description: subcategory.description }
                    : {}),

                isActive: subcategory.isActive
            })),

            isActive: document.isActive,

            ...(document.createdAt
                ? { createdAt: document.createdAt }
                : {}),

            ...(document.updatedAt
                ? { updatedAt: document.updatedAt }
                : {})
        });
    }



    static toPersistence(entity: MechanicCategory) {
        return {
            name: entity.name,
            slug: entity.slug,

            ...(entity.description !== undefined
                ? { description: entity.description }
                : {}),

            subcategories: entity.subcategories.map(subcategory => ({
                ...(subcategory.id
                    ? { _id: subcategory.id }
                    : {}),

                name: subcategory.name,
                slug: subcategory.slug,

                ...(subcategory.description !== undefined
                    ? { description: subcategory.description }
                    : {}),

                isActive: subcategory.isActive
            })),

            isActive: entity.isActive
        };
    }

}
