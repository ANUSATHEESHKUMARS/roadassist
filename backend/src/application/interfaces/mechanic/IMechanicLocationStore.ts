import type { StoredMechanicLocation } from "../../dtos/mechanic/MechanicLiveLocationDto.js";

export interface IMechanicLocationStore {
    save(
        location: StoredMechanicLocation
    ): Promise<void>;

    get(
        requestId: string
    ): Promise<StoredMechanicLocation | null>;
}