import apiClient from "./apiClient";
import type { RegisterRequest } from "@/types/auth";
import API_ROUTES from "./apiRoutes";

export const register = async (data: RegisterRequest) => {
  const response = await apiClient.post(API_ROUTES.AUTH.REGISTER, data)
  return response.data
}


export const verifyOtp = async (data: {
  email: string;
  otp: string;
  purpose: "EMAIL_VERIFICATION";
}) => {
  const response = await apiClient.post(
    API_ROUTES.AUTH.VERIFY_OTP,
    data
  );

  return response.data;
};

export const login = async (data: { email: string, password: string }) => {
  try{
    const response = await apiClient.post(API_ROUTES.AUTH.LOGIN, data)
  return response.data
  }catch(error){
    console.log("login api error", error)
    throw error
  }
}

export const googleLogin = async (idToken: string) => {
  const response = await apiClient.post(API_ROUTES.AUTH.GOOGLE_LOGIN, {
    idToken
  });

  return response.data;
};

export const resendOtp = async (data: { email: string, purpose: "EMAIL_VERIFICATION" }) => {
  const response = await apiClient.post(API_ROUTES.AUTH.RESEND_OTP, data)
  return response.data
}



export const getCurrentUser = async () => {
  const response = await apiClient.get(API_ROUTES.AUTH.CURRENT_USER)
  return response.data
}

export const logout = async () => {
  const response = await apiClient.post(API_ROUTES.AUTH.LOGOUT)
  return response.data
}




export const requestPasswordReset = async (data : {email : string}) => {
  const response = await apiClient.post(API_ROUTES.AUTH.FORGOT_PASSWORD, data)

  return response.data
}

export const verifyPasswordResetOtp = async (data : {email : string , otp : string}) => {
  const response = await apiClient.post(API_ROUTES.AUTH.VERIFY_RESET_OTP,data)
  return response.data
}

export const resetPassword = async (data : {resetToken:string; newPassword:string})=>{
  const response = await apiClient.post(API_ROUTES.AUTH.RESET_PASSWORD,data)
  return response.data
}