import apiClient from "@/services/apiClient";
import API_ROUTES from "@/services/apiRoutes";
import type {
    BookingCommonResponse,
    BookingDetailsResponse,
    BookingStatusResponse,
    CreateBookingReservationPayload,
    CreateBookingReservationResponse,
    CreatePaymentOrderResponse,
    DiscoverMechanicsPayload,
    DiscoverMechanicsResponse,
    GetMyBookingsParams,
    GetMyBookingsResponse,
    VerifyPaymentPayload,
    VerifyPaymentResponse,
} from "@/types/user/scheduledBooking";

function requireBookingId(bookingId: string): string {
    if (typeof bookingId !== "string" || bookingId.trim().length === 0) {
        throw new Error("A valid booking ID is required.");
    }
    return encodeURIComponent(bookingId.trim());
}

function unwrapResponse<T>(payload: unknown, operation: string): T {
    if (!payload || typeof payload !== "object") {
        throw new Error(`Invalid response format received for ${operation}.`);
    }

    const record = payload as Partial<BookingCommonResponse<T>>;

    if (record.success !== true) {
        throw new Error(
            typeof record.message === "string" && record.message.trim().length > 0
                ? record.message
                : `Unexpected failure response received for ${operation}.`
        );
    }

    if (record.data === undefined || record.data === null) {
        throw new Error(`Missing response data for ${operation}.`);
    }

    return record.data;
}

export const scheduledBookingService = {
    async discoverMechanics(
        payload: DiscoverMechanicsPayload
    ): Promise<DiscoverMechanicsResponse> {
        const response = await apiClient.post<
            BookingCommonResponse<DiscoverMechanicsResponse>
        >(API_ROUTES.BOOKING.DISCOVER, payload);

        return unwrapResponse<DiscoverMechanicsResponse>(
            response.data,
            "mechanic discovery"
        );
    },

    async createReservation(
        payload: CreateBookingReservationPayload
    ): Promise<CreateBookingReservationResponse> {
        const response = await apiClient.post<
            BookingCommonResponse<CreateBookingReservationResponse>
        >(API_ROUTES.BOOKING.RESERVATIONS, payload);

        return unwrapResponse<CreateBookingReservationResponse>(
            response.data,
            "booking reservation"
        );
    },

    async createPaymentOrder(
        bookingId: string
    ): Promise<CreatePaymentOrderResponse> {
        const safeId = requireBookingId(bookingId);

        const response = await apiClient.post<
            BookingCommonResponse<CreatePaymentOrderResponse>
        >(API_ROUTES.BOOKING.PAYMENT_ORDER(safeId));

        return unwrapResponse<CreatePaymentOrderResponse>(
            response.data,
            "payment order creation"
        );
    },

    async verifyPayment(
        payload: VerifyPaymentPayload
    ): Promise<VerifyPaymentResponse> {
        const safeId = requireBookingId(payload.bookingId);
        const verificationBody = {
            razorpayOrderId: payload.razorpayOrderId,
            razorpayPaymentId: payload.razorpayPaymentId,
            razorpaySignature: payload.razorpaySignature,
        };

        const response = await apiClient.post<
            BookingCommonResponse<VerifyPaymentResponse>
        >(API_ROUTES.BOOKING.VERIFY_PAYMENT(safeId), verificationBody);

        return unwrapResponse<VerifyPaymentResponse>(
            response.data,
            "payment verification"
        );
    },

    async getBookingStatus(bookingId: string): Promise<BookingStatusResponse> {
        const safeId = requireBookingId(bookingId);

        const response = await apiClient.get<
            BookingCommonResponse<BookingStatusResponse>
        >(API_ROUTES.BOOKING.STATUS(safeId));

        return unwrapResponse<BookingStatusResponse>(
            response.data,
            "booking status"
        );
    },

    async getBookingDetails(bookingId: string): Promise<BookingDetailsResponse> {
        const safeId = requireBookingId(bookingId);

        const response = await apiClient.get<
            BookingCommonResponse<BookingDetailsResponse>
        >(API_ROUTES.BOOKING.BY_ID(safeId));

        return unwrapResponse<BookingDetailsResponse>(
            response.data,
            "booking details"
        );
    },

    async getMyBookings(
        params?: GetMyBookingsParams
    ): Promise<GetMyBookingsResponse> {
        const response = await apiClient.get<
            BookingCommonResponse<GetMyBookingsResponse>
        >(API_ROUTES.BOOKING.MY_BOOKINGS, { params });

        return unwrapResponse<GetMyBookingsResponse>(
            response.data,
            "booking history"
        );
    },
};
