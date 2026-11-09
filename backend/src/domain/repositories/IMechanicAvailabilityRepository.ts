import { MechanicAvailability } from "../User/entities/MechanicAvailability.js";

export interface IMechanicAvailabilityRepository {
    upsert(
        mechanicId: string,
        isAvailable: boolean,
        latitude: number,
        longitude: number
    ): Promise<MechanicAvailability>;

    findByMechanicId(mechanicId: string): Promise<MechanicAvailability | null>;
}

