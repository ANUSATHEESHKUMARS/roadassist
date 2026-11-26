
import { Booking } from "../../../domain/User/entities/Booking.js";
import { BookingSlot } from "../../../domain/User/Types/BookingTypes.js";
import { CreateSlotBookingDto } from "../../dtos/CreateSlotBookingDto.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IVehicleRepository } from "../../../domain/repositories/IVehicleRepository.js";
import { IMechanicApplicationRepository } from "../../../domain/repositories/IMechanicApplicationRepository.js";
import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";

import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";

const BOOKING_AMOUNT = 800;

const INDIA_TIME_ZONE = "Asia/Kolkata";

const weekdayMap = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
] as const;

export class CreateSlotBookingUseCase {

    constructor(
        private readonly userRepository: IUserRepository,
        private readonly vehicleRepository: IVehicleRepository,
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository,
        private readonly mechanicScheduleRepository: IMechanicScheduleRepository,
        private readonly bookingRepository: IBookingRepository
    ) {}

    async execute(
        userId: string,
        dto: CreateSlotBookingDto
    ): Promise<Booking> {

        // 1. Validate the booking date
        const scheduledDate = new Date(dto.scheduledDate);

        if (Number.isNaN(scheduledDate.getTime())) {
            throw new BadRequest("Invalid booking date");
        }

        const selectedDate = this.getIndiaDateParts(scheduledDate);
        const today = this.getIndiaDateParts(new Date());

        const selectedDateValue =
            selectedDate.year * 10000 +
            selectedDate.month * 100 +
            selectedDate.day;

        const todayValue =
            today.year * 10000 +
            today.month * 100 +
            today.day;

        if (selectedDateValue < todayValue) {
            throw new BadRequest("Booking date cannot be in the past");
        }

        // 2. Validate the selected slot
        const validSlots: BookingSlot[] = [
            "morning",
            "afternoon",
            "full_day"
        ];

        if (!validSlots.includes(dto.slot)) {
            throw new BadRequest("Invalid booking slot");
        }

        // 3. Find and validate the customer's vehicle
        const vehicle = await this.vehicleRepository.findById(
            dto.vehicleId
        );

        if (!vehicle) {
            throw new NotfoundError("Vehicle not found");
        }

        if (vehicle.userId !== userId) {
            throw new ForbiddenError(
                "You are not authorized to book using this vehicle"
            );
        }

        // 4. Validate the mechanic's user account
        const mechanic = await this.userRepository.findById(
            dto.mechanicId
        );

        if (!mechanic) {
            throw new NotfoundError("Mechanic not found");
        }

        if (mechanic.status !== "active") {
            throw new ForbiddenError("Mechanic account is not active");
        }

        if (!mechanic.roles.includes("mechanic")) {
            throw new ForbiddenError(
                "Selected user is not registered as a mechanic"
            );
        }

        // 5. Validate mechanic application
        const application =
            await this.mechanicApplicationRepository.findByUserId(
                dto.mechanicId
            );

        if (!application || application.status !== "approved") {
            throw new ForbiddenError(
                "Mechanic application is not approved"
            );
        }

        // 6. Validate supported vehicle type
        if (
            !application.supportedVehicleTypes.includes(
                vehicle.vehicleType
            )
        ) {
            throw new BadRequest(
                "Mechanic does not support this vehicle type"
            );
        }

        // 7. Validate offered service
        if (!application.serviceOffered.includes(dto.serviceType)) {
            throw new BadRequest(
                "Mechanic does not offer this service"
            );
        }

        // 8. Validate mechanic schedule
        const schedule =
            await this.mechanicScheduleRepository.findByMechanicId(
                dto.mechanicId
            );

        if (!schedule || !schedule.isActive) {
            throw new ConflictError(
                "Mechanic does not have an active schedule"
            );
        }

        const selectedWeekday =
            weekdayMap[selectedDate.weekday];

        const dailySchedule = schedule.weeklyAvailability.find(
            item => item.day === selectedWeekday
        );

        if (!dailySchedule) {
            throw new ConflictError(
                "Mechanic is not available on this day"
            );
        }

        const isShiftAvailable =
            dto.slot === "morning"
                ? dailySchedule.morning
                : dto.slot === "afternoon"
                    ? dailySchedule.afternoon
                    : dailySchedule.morning && dailySchedule.afternoon;

        if (!isShiftAvailable) {
            throw new ConflictError(
                "Mechanic is not available for the selected shift"
            );
        }

        // 9. Check for an existing conflicting booking
        const conflictingBooking =
            await this.bookingRepository.findConflictingBooking(
                dto.mechanicId,
                scheduledDate,
                dto.slot
            );

        if (conflictingBooking) {
            throw new ConflictError(
                "This mechanic is already booked for the selected slot"
            );
        }

        // 10. Create the booking domain entity
        const booking = Booking.create({
            userId,
            vehicleId: dto.vehicleId,
            mechanicId: dto.mechanicId,

            bookingType: "scheduled",

            serviceType: dto.serviceType.trim(),
            serviceAddress: dto.serviceAddress.trim(),

            scheduledDate,
            slot: dto.slot,

            bookingAmount: BOOKING_AMOUNT,
            status: "pending"
        });

        // 11. Persist the booking
        return await this.bookingRepository.create(booking);
    }

    private getIndiaDateParts(date: Date) {
        const parts = new Intl.DateTimeFormat("en-IN", {
            timeZone: INDIA_TIME_ZONE,
            year: "numeric",
            month: "numeric",
            day: "numeric",
            weekday: "long"
        }).formatToParts(date);

        const getPart = (type: string): string => {
            const value = parts.find(part => part.type === type)?.value;

            if (!value) {
                throw new BadRequest("Unable to process booking date");
            }

            return value;
        };

        const weekdayName = getPart("weekday").toLowerCase();

        const weekday = weekdayMap.indexOf(
            weekdayName as typeof weekdayMap[number]
        );

        return {
            year: Number(getPart("year")),
            month: Number(getPart("month")),
            day: Number(getPart("day")),
            weekday
        };
    }
}
