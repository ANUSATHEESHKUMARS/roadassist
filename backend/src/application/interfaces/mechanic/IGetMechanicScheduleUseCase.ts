import { MechanicSchedule } from "../../../domain/User/entities/MechanicSchedule.js";

export interface IGetMechanicScheduleUseCase {
    execute(
        mechanicId: string
    ): Promise<MechanicSchedule | null>;
}