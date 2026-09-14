import apiClient from "./apiClient";
import type { RegisterRequest } from "@/types/auth";



export const register = async (data: RegisterRequest) => {
    console.log("auth service ", data)
    const response = await apiClient.post('/auth/register', data)
    console.log(response)
    return response.data
}
export const verifyOtp = async (data: {
  email: string;
  otp: string;
  purpose: "EMAIL_VERIFICATION";
}) => {
  const response = await apiClient.post(
    "/auth/verifyotp",
    data
  );

  return response.data;
};

