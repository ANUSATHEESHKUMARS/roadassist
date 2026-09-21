import apiClient from "./apiClient";
import type { RegisterRequest } from "@/types/auth";

export const register = async (data: RegisterRequest) => {
  const response = await apiClient.post('/auth/register', data)
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

export const resendOtp = async (data: { email: string, purpose: "EMAIL_VERIFICATION" }) => {
  const response = await apiClient.post('/auth/resend', data)
  return response.data
}

export const getVehicles = async () => {
  const response = await apiClient.get(
    "/vehicle/getvehicles"
  );

  return response.data;
};