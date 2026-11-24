
import { useCallback, useEffect, useState } from "react";

import { mechanicCategoryService } from "@/services/admin/mechanicCategoryService";

import type {
    MechanicCategory,
    CreateMechanicCategoryDto,
    UpdateMechanicCategoryDto,
    UpdateMechanicCategoryStatusDto,
} from "@/types/admin/mechanicCategory.types";

export const useMechanicCategories = () => {

    // Category data
    const [categories, setCategories] = useState<MechanicCategory[]>([]);

    // Loading state
    const [loading, setLoading] = useState<boolean>(false);

    // Error state
    const [error, setError] = useState<string | null>(null);

    // Current filter
    const [includeInactive, setIncludeInactive] = useState<boolean>(true);

    // Fetch all categories
    const fetchCategories = useCallback(async (
        showInactive = true
    ) => {
        try {
            setLoading(true);
            setError(null);

            const data = await mechanicCategoryService.getAll(showInactive);

            setCategories(data);
            setIncludeInactive(showInactive);

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to fetch mechanic categories";

            setError(message);

            // Allow the page to handle the failure too.
            throw error;

        } finally {
            setLoading(false);
        }
    }, []);

    // Create category
    const createCategory = async (
        dto: CreateMechanicCategoryDto
    ) => {
        try {
            setError(null);

            const newCategory =
                await mechanicCategoryService.create(dto);

            setCategories((prev) => {
                if (!includeInactive && !newCategory.isActive) {
                    return prev;
                }

                return [newCategory, ...prev];
            });

            return newCategory;

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to create mechanic category";

            setError(message);
            throw error;
        }
    };

    // Update category
    const updateCategory = async (
        id: string,
        dto: UpdateMechanicCategoryDto
    ) => {
        try {
            setError(null);

            const updatedCategory =
                await mechanicCategoryService.update(id, dto);

            setCategories((prev) => {
                if (!includeInactive && !updatedCategory.isActive) {
                    return prev.filter((category) => category.id !== id);
                }

                return prev.map((category) =>
                    category.id === id ? updatedCategory : category
                );
            });

            return updatedCategory;

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update mechanic category";

            setError(message);
            throw error;
        }
    };

    // Activate / Deactivate category
    const updateCategoryStatus = async (
        id: string,
        dto: UpdateMechanicCategoryStatusDto
    ) => {
        try {
            setError(null);

            const updatedCategory =
                await mechanicCategoryService.updateStatus(id, dto);

            setCategories((prev) => {
                if (!includeInactive && !updatedCategory.isActive) {
                    return prev.filter((category) => category.id !== id);
                }

                const exists = prev.some((category) => category.id === id);

                if (exists) {
                    return prev.map((category) =>
                        category.id === id ? updatedCategory : category
                    );
                }

                return [updatedCategory, ...prev];
            });
            return updatedCategory;

        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to update category status";

            setError(message);
            throw error;
        }
    };

    // Initial fetch
    useEffect(() => {
        void fetchCategories(true).catch(() => undefined);
    }, [fetchCategories]);

    return {
        categories,
        loading,
        error,
        includeInactive,
        fetchCategories,
        createCategory,
        updateCategory,
        updateCategoryStatus,
    };
};
