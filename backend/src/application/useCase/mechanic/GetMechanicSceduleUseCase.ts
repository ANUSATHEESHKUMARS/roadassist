import { IBookingRepository } from "../../../domain/repositories/IBookingRepository.js";
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import {
    getIndiaDateRangeForDayKeys,
    getIndiaDayKey,
    getIndiaTodayDateKey,
} from "../../../shared/utils/timezone.js";
import {
    IGetMechanicScheduleUseCase,
    MechanicBookedDateItem,
} from "../../interfaces/mechanic/IGetMechanicScheduleUseCase.js";

const MONTH_REGEX = /^\d{4}-\d{2}$/;

export class GetMechanicScheduleUseCase
    implements IGetMechanicScheduleUseCase
{
    constructor(
        private readonly mechanicScheduleRepository: IMechanicScheduleRepository,
        private readonly bookingRepository?: IBookingRepository
    ) {}

    async execute(mechanicId: string) {
        const schedule =
            await this.mechanicScheduleRepository.findByMechanicId(mechanicId);

        if (!schedule) {
            throw new NotfoundError("Mechanic schedule not found");
        }

        return schedule;
    }

    async getBookedDates(
        mechanicId: string,
        month?: string
    ): Promise<MechanicBookedDateItem[]> {
        if (!this.bookingRepository) {
            return [];
        }

        const resolvedMonth =
            month && month.trim() !== ""
                ? month.trim()
                : getIndiaTodayDateKey().slice(0, 7);

        if (!MONTH_REGEX.test(resolvedMonth)) {
            throw new BadRequest(
                "Invalid month format. Use YYYY-MM",
                "INVALID_MONTH_FORMAT"
            );
        }

        const [yearStr, monthStr] = resolvedMonth.split("-");
        const year = Number(yearStr);
        const monthNum = Number(monthStr);

        if (monthNum < 1 || monthNum > 12) {
            throw new BadRequest("Invalid month value", "INVALID_MONTH_FORMAT");
        }

        const lastDay = new Date(Date.UTC(year, monthNum, 0)).getUTCDate();
        const startDateKey = `${resolvedMonth}-01`;
        const endDateKey = `${resolvedMonth}-${String(lastDay).padStart(2, "0")}`;

        const { startOfRange, endOfRange } = getIndiaDateRangeForDayKeys(
            startDateKey,
            endDateKey
        );

        const bookings =
            await this.bookingRepository.findActiveScheduledBookingsByMechanic(
                mechanicId,
                startOfRange,
                endOfRange
            );

        return bookings
            .filter((booking) => Boolean(booking.id))
            .map((booking) => ({
                bookingId: booking.id!,
                date: getIndiaDayKey(booking.scheduledDate),
                slot: booking.slot,
                status: booking.status,
            }));
    }
}
