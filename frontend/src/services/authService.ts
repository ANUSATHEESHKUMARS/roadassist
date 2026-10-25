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
  try{
    const response = await apiClient.post('/auth/login', data)
  return response.data
  }catch(error){
    console.log("login api error", error)
    throw error
  }
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



export const getCurrentUser = async () => {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export const logout = async () => {
  const response = await apiClient.post('/auth/logout')
  return response.data
}




export const requestPasswordReset = async (data : {email : string}) => {
  const response = await apiClient.post('/auth/forget-password', data)

  return response.data
}

export const verifyPasswordResetOtp = async (data : {email : string , otp : string}) => {
  const response = await apiClient.post('/auth/verify-reset-otp',data)
  return response.data
}

export const resetPassword = async (data : {resetToken:string; newPassword:string})=>{
  const response = await apiClient.post('/auth/reset-password',data)
  return response.data
}