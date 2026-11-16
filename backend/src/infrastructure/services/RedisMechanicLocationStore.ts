import redisClient from "../redis.js";

import type {
    IMechanicLocationStore
} from "../../application/interfaces/mechanic/IMechanicLocationStore.js";

import type { StoredMechanicLocation } from "../../application/dtos/mechanic/MechanicLiveLocationDto.js";
export class RedisMechanicLocationStore
    implements IMechanicLocationStore {

    private readonly prefix = "mechanic-location:";
    private readonly ttl = 60;

    async save(
        location: StoredMechanicLocation
    ): Promise<void> {

        const key = `${this.prefix}${location.requestId}`;

        await redisClient.set(
            key,
            JSON.stringify(location),
            {
                EX: this.ttl
            }
        );
    }
}