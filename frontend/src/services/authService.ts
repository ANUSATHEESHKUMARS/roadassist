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

export const login = async (data: { email: string, password: string }) => {
  const response = await apiClient.post('/auth/login', data)
  return response.data
}

export const googleLogin = async (idToken: string) => {
    const response = await apiClient.post("/auth/google", {
        idToken
    });

    return response.data;
};