
// import apiClient from "@/services/apiClient";

// import type {
//   MechanicApplicationDTO,
//   MechanicApplicationStatus,
// } from "@/types/admin/mechanic";

// interface ApiResponse<T> {
//   success: boolean;
//   message: string;
//   data: T;
// }


// export const getMechanicApplications = async (
//   status?: MechanicApplicationStatus
// ): Promise<MechanicApplicationDTO[]> => {
//   const response = await apiClient.get<
//     ApiResponse<MechanicApplicationDTO[]>
//   >("/admin/mechanic-applications", {
//     params: status ? { status } : {},
//   });

//   return response.data.data;
// };
