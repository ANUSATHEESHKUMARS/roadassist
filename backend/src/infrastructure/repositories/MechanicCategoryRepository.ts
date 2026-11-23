
import { Types } from "mongoose";

import { MechanicCategoryModel } from "../databases/models/MechanicCategortModel.js";

import { MechanicCategoryMapper } from "../../application/mappers/MechanicCategoryMapper.js";

import { MechanicCategory } from "../../domain/User/entities/MechanicCategory.js";

import { IMechanicCategoryRepository } from "../../domain/repositories/admin/IMechanicCategoryRepository.js";


export class MechanicCategoryRepository
    implements IMechanicCategoryRepository {

    // Create a new category
    async create(
        category: MechanicCategory
    ): Promise<MechanicCategory> {

        const categoryData =
            MechanicCategoryMapper.toPersistence(category);

        const createdCategory =
            await MechanicCategoryModel.create(categoryData);

        return MechanicCategoryMapper.toEntity(createdCategory);
    }


    // Find category by ID
    async findById(
        id: string
    ): Promise<MechanicCategory | null> {

        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        const category =
            await MechanicCategoryModel.findById(id).lean().exec();

        if (!category) {
            return null;
        }

        return MechanicCategoryMapper.toEntity(category);
    }


    // Find category by slug
    async findBySlug(
        slug: string
    ): Promise<MechanicCategory | null> {

        const category =
            await MechanicCategoryModel.findOne({ slug }).lean().exec();

        if (!category) {
            return null;
        }

        return MechanicCategoryMapper.toEntity(category);
    }


    // Find all categories
    async findAll(
        includeInactive = false
    ): Promise<MechanicCategory[]> {

        const filter = includeInactive
            ? {}
            : { isActive: true };

        const categories =
            await MechanicCategoryModel
                .find(filter)
                .sort({ createdAt: -1 })
                .lean()
                .exec();

        return categories.map(category =>
            MechanicCategoryMapper.toEntity(category)
        );
    }


    // Update category details
    async update(
        category: MechanicCategory
    ): Promise<MechanicCategory | null> {

        if (!category.id || !Types.ObjectId.isValid(category.id)) {
            return null;
        }

        const categoryData =
            MechanicCategoryMapper.toPersistence(category);

        const updatedCategory =
            await MechanicCategoryModel.findByIdAndUpdate(
                category.id,
                { $set: categoryData },
                {
                    new: true,
                    runValidators: true
                }
            ).lean().exec();

        if (!updatedCategory) {
            return null;
        }

        return MechanicCategoryMapper.toEntity(updatedCategory);
    }


    // Activate or deactivate category
    async updateStatus(
        id: string,
        isActive: boolean
    ): Promise<MechanicCategory | null> {

        if (!Types.ObjectId.isValid(id)) {
            return null;
        }

        const updatedCategory =
            await MechanicCategoryModel.findByIdAndUpdate(
                id,
                {
                    $set: { isActive }
                },
                {
                    new: true,
                    runValidators: true
                }
            ).lean().exec();

        if (!updatedCategory) {
            return null;
        }

        return MechanicCategoryMapper.toEntity(updatedCategory);
    }
}
