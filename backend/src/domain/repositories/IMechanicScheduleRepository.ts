import { MechanicSchedule } from "../User/entities/MechanicSchedule.js";


export interface IMechanicScheduleRepository {

    create(
        schedule: MechanicSchedule
    ): Promise<MechanicSchedule>;

    findByMechanicId(
        mechanicId: string
    ): Promise<MechanicSchedule | null>;

    update(
        mechanicId: string,
        schedule: Partial<MechanicSchedule>
    ): Promise<MechanicSchedule | null>;

    findActiveByMechanicIds(
        mechanicIds: string[]
    ): Promise<MechanicSchedule[]>;
}
