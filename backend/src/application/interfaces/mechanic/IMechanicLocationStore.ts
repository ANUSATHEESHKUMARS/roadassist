import type { StoredMechanicLocation } from "../../dtos/mechanic/MechanicLiveLocationDto.js";

export interface IMechanicLocationStore {
    save(
        location: StoredMechanicLocation
    ): Promise<void>;
}