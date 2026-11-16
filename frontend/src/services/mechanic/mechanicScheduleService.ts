
import apiClient from "../apiClient";
import API_ROUTES from "../apiRoutes";
import type {
    MechanicSchedule,
    CreateMechanicScheduleDto,
    UpdateMechanicScheduleDto,
    CommonResponse,
} from "../../types/mechanic/mechanicSchedule"

export const mechanicScheduleService = {
    async getSchedule(): Promise<MechanicSchedule> {
        const response = await apiClient.get<
            CommonResponse<MechanicSchedule>
        >(API_ROUTES.MECHANIC.SCHEDULE.BASE);

        if (!response.data.data) {
            throw new Error("Schedule data not found");
        }

        return response.data.data;
    },

    async createSchedule(
        data: CreateMechanicScheduleDto
    ): Promise<MechanicSchedule> {
        const response = await apiClient.post<
            CommonResponse<MechanicSchedule>
        >(API_ROUTES.MECHANIC.SCHEDULE.CREATE, data);

        if (!response.data.data) {
            throw new Error("Unable to create schedule");
        }

        return response.data.data;
    },

    async updateSchedule(
        data: UpdateMechanicScheduleDto
    ): Promise<MechanicSchedule> {
        const response = await apiClient.patch<
            CommonResponse<MechanicSchedule>
        >(API_ROUTES.MECHANIC.SCHEDULE.UPDATE, data);

        if (!response.data.data) {
            throw new Error("Unable to update schedule");
        }

        return response.data.data;
    },
};
