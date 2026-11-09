
const API_ROUTES = {
  AUTH: {
    REGISTER: "/auth/register",
    VERIFY_OTP: "/auth/verifyotp",
    LOGIN: "/auth/login",
    GOOGLE_LOGIN: "/auth/google",
    RESEND_OTP: "/auth/resend",
    CURRENT_USER: "/auth/me",
    LOGOUT: "/auth/logout",
    FORGOT_PASSWORD: "/auth/forget-password",
    VERIFY_RESET_OTP: "/auth/verify-reset-otp",
    RESET_PASSWORD: "/auth/reset-password",
  },

  USER: {
    PROFILE: "/user/profile",
  },

  VEHICLE: {
    CREATE: "/vehicle/create",
    LIST: "/vehicle/getvehicles",

    BY_ID: (vehicleId: string) => `/vehicle/${vehicleId}`,
  },

  MECHANIC: {
    DRAFT: "/mechanic/draft",
    SUBMIT: "/mechanic/submit",
    UPLOAD_MEDIA: "/mechanic/media/upload",
    MY_APPLICATION: "/mechanic/my-application",
    BOOKINGS: "/mechanic/bookings",

    AVAILABILITY: "/mechanic/availability",
    NEARBY_EMERGENCY_REQUESTS: "/mechanic/emergency-requests/nearby",

    ACCEPT_EMERGENCY_REQUEST: (requestId: string) =>
      `/mechanic/emergency-requests/${requestId}/accept`,

    REJECT_EMERGENCY_REQUEST: (requestId: string) =>
      `/mechanic/emergency-requests/${requestId}/reject`,

    ASSIGNED_REQUEST: (requestId: string) =>
      `/mechanic/emergency-requests/${requestId}`,
  },

  ADMIN: {
    USERS: "/admin/users",

    BLOCK_USER: (userId: string) =>
      `/admin/user/${userId}/block`,

    UNBLOCK_USER: (userId: string) =>
      `/admin/user/${userId}/unblock`,

    MECHANIC_APPLICATIONS: "/admin/mechanic-applications",

    APPROVE_MECHANIC_APPLICATION: (applicationId: string) =>
      `/admin/mechanic-applications/${applicationId}/approve`,

    REJECT_MECHANIC_APPLICATION: (applicationId: string) =>
      `/admin/mechanic-applications/${applicationId}/reject`,

    UPLOAD_MEDIA: "/admin/media/upload",
    MEDIA: "/admin/media",

    MEDIA_BY_ID: (mediaId: string) =>
      `/admin/media/${mediaId}`,
  },
  SUPERADMIN: {
    ADMINS: "/superadmin/admins",
  },


  MEDIA: {
    PUBLIC: "/media",
  },

  EMERGENCY_REQUEST: {
    BASE: "/emergency-requests",
    UPLOAD_IMAGES: "/emergency-requests/images",
    MY_REQUESTS: "/emergency-requests/my-requests",

    BY_ID: (requestId: string) =>
      `/emergency-requests/${requestId}`,
  },

  BOOKING: {
    BASE: "/bookings",
    MY_BOOKINGS: "/bookings/my-bookings",
    AVAILABLE_SLOTS: "/bookings/available-slots",

    BY_ID: (bookingId: string) => `/bookings/${bookingId}`,

    CANCEL: (bookingId: string) =>
      `/bookings/${bookingId}/cancel`,
  },
} as const;

export default API_ROUTES;
