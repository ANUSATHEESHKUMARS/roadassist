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

    async getMyApplication(): Promise<MechanicApplication> {
        const response = await apiClient.get<
            CommonResponse<MechanicApplication>
        >(API_ROUTES.MECHANIC.MY_APPLICATION);

        if (!response.data.data) {
            throw new Error("Mechanic application not found");
        }

        return response.data.data;
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

        if (!response.data.data) {
            throw new Error("Unable to update service location");
        }

        return response.data.data;
    },
};