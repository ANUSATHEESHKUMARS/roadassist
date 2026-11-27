import {
    BookingDetailsResponseDto,
    BookingStatusResponseDto,
    CreateBookingReservationDto,
    CreateBookingReservationResponseDto,
    CreatePaymentOrderDto,
    CreatePaymentOrderResponseDto,
    DiscoverMechanicsDto,
    DiscoverMechanicsResponseDto,
    GetMechanicBookingsQueryDto,
    GetMechanicBookingsResponseDto,
    GetMyBookingsQueryDto,
    GetMyBookingsResponseDto,
    MechanicBookingActionResponseDto,
    VerifyPaymentDto,
    VerifyPaymentResponseDto,
    WebhookProcessResultDto,
} from "../../dtos/booking/ScheduledBookingDtos.js";

export interface IDiscoverAvailableMechanicsUseCase {
    execute(
        userId: string,
        dto: DiscoverMechanicsDto
    ): Promise<DiscoverMechanicsResponseDto>;
}

export interface ICreateBookingReservationUseCase {
    execute(
        userId: string,
        dto: CreateBookingReservationDto
    ): Promise<CreateBookingReservationResponseDto>;
}

export interface ICreatePaymentOrderUseCase {
    execute(
        userId: string,
        dto: CreatePaymentOrderDto
    ): Promise<CreatePaymentOrderResponseDto>;
}

export interface IVerifyPaymentUseCase {
    execute(
        userId: string,
        dto: VerifyPaymentDto
    ): Promise<VerifyPaymentResponseDto>;
}

export interface IHandlePaymentWebhookUseCase {
    execute(
        rawBody: Buffer | string,
        signature: string,
        payload: unknown
    ): Promise<WebhookProcessResultDto>;
}

export interface IGetBookingStatusUseCase {
    execute(
        userId: string,
        bookingId: string
    ): Promise<BookingStatusResponseDto>;
}

export interface IGetBookingDetailsUseCase {
    execute(
        userId: string,
        bookingId: string,
        expectedRole?: "user" | "mechanic"
    ): Promise<BookingDetailsResponseDto>;
}

export interface IGetMyBookingsUseCase {
    execute(
        userId: string,
        query?: GetMyBookingsQueryDto
    ): Promise<GetMyBookingsResponseDto>;
}

export interface IGetMechanicBookingsUseCase {
    execute(
        mechanicId: string,
        query?: GetMechanicBookingsQueryDto
    ): Promise<GetMechanicBookingsResponseDto>;
}

export interface IStartMechanicBookingUseCase {
    execute(
        mechanicId: string,
        bookingId: string
    ): Promise<MechanicBookingActionResponseDto>;
}

export interface ICompleteMechanicBookingUseCase {
    execute(
        mechanicId: string,
        bookingId: string
    ): Promise<MechanicBookingActionResponseDto>;
}

