
import apiClient from "@/services/apiClient";
import API_ROUTES from "../apiRoutes";
import type {
    MechanicCategory,
    CreateMechanicCategoryDto,
    UpdateMechanicCategoryDto,
    UpdateMechanicCategoryStatusDto,
} from "@/types/admin/mechanicCategory.types";

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const mechanicCategoryService = {

    // GET ALL CATEGORIES
    getAll: async (
        includeInactive = false
    ): Promise<MechanicCategory[]> => {

        const response = await apiClient.get<
            ApiResponse<MechanicCategory[]>
        >(API_ROUTES.ADMIN.MECHANIC_CATEGORIES.BASE, {
            params: { includeInactive },
        });

        return response.data.data;
    },

    // CREATE CATEGORY
    create: async (
        dto: CreateMechanicCategoryDto
    ): Promise<MechanicCategory> => {

        const response = await apiClient.post<
            ApiResponse<MechanicCategory>
        >(API_ROUTES.ADMIN.MECHANIC_CATEGORIES.BASE, dto);

        return response.data.data;
    },

    // UPDATE CATEGORY
    update: async (
        id: string,
        dto: UpdateMechanicCategoryDto
    ): Promise<MechanicCategory> => {

        const response = await apiClient.put<
            ApiResponse<MechanicCategory>
        >(
            API_ROUTES.ADMIN.MECHANIC_CATEGORIES.BY_ID(id),
            dto
        );

        return response.data.data;
    },

    // ACTIVATE / DEACTIVATE CATEGORY
    updateStatus: async (
        id: string,
        dto: UpdateMechanicCategoryStatusDto
    ): Promise<MechanicCategory> => {

        const response = await apiClient.patch<
            ApiResponse<MechanicCategory>
        >(
            API_ROUTES.ADMIN.MECHANIC_CATEGORIES.UPDATE_STATUS(id),
            dto
        );

        return response.data.data;
    },
};
