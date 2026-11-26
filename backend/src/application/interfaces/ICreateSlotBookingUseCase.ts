import { Booking } from "../../domain/User/entities/Booking.js";
import { CreateSlotBookingDto } from "../dtos/CreateSlotBookingDto.js";


export interface ICreateSlotBookingUseCase {
    execute(
        userId: string,
        dto: CreateSlotBookingDto
    ): Promise<Booking>;
}