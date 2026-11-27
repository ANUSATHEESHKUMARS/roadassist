import apiClient from "../apiClient";
import API_ROUTES from "../apiRoutes";

import type {
    MechanicApplication,
    UpdateMechanicServiceLocationDto,
} from "../../types/mechanic/mechanicapplication";

import type {
    CommonResponse,
} from "../../types/mechanic/mechanicSchedule";

export const mechanicServiceLocationService = {

    async getMyApplication(): Promise<MechanicApplication | null> {
        const response = await apiClient.get<
            CommonResponse<MechanicApplication | null>
        >(API_ROUTES.MECHANIC.MY_APPLICATION);

        if (!response.data || response.data.success === false) {
            throw new Error(
                response.data?.message || "Unable to fetch mechanic application"
            );
        }

        return response.data.data ?? null;
    },

    async updateServiceLocation(
        data: UpdateMechanicServiceLocationDto
    ): Promise<MechanicApplication> {

        const response = await apiClient.patch<
            CommonResponse<MechanicApplication>
        >(
            API_ROUTES.MECHANIC.SERVICE_LOCATION,
            data
        );

        if (!response.data || response.data.success === false) {
            throw new Error(
                response.data?.message || "Unable to update service location"
            );
        }

        if (!response.data.data) {
            throw new Error(
                "Unable to update service location: missing response data"
            );
        }

        return response.data.data;
    },
};
