import redisClient from "../redis.js";
import { IPendingRegistrationRepository } from "../../domain/repositories/IPendingRegistration.js";
import { PendingRegistration } from "../../domain/User/entities/PendingRegistration.js";

export class RedisPendingRegistrationRepository implements IPendingRegistrationRepository {

    private readonly prefix = "pending-registration:";
    private readonly ttl = 600;

    async save(data: PendingRegistration): Promise<void> {

        const key = `${this.prefix}${data.email}`;

        await redisClient.set(
            key,
            JSON.stringify({
                fullName: data.fullName,
                email: data.email,
                phoneNumber: data.phoneNumber,
                passwordHash: data.getPassword(),
                expiresAt: data.expiresAt
            }),
            {
                EX: this.ttl
            }
        );
    }

    async findByEmail(
        email: string
    ): Promise<PendingRegistration | null> {

        const key = `${this.prefix}${email}`;

        const data = await redisClient.get(key);

        if (!data) {
            return null;
        }

        const parsedData = JSON.parse(data);

        return new PendingRegistration(
            parsedData.fullName,
            parsedData.email,
            parsedData.phoneNumber,
            parsedData.passwordHash,
            new Date(parsedData.expiresAt)
        );
    }

    async deleteByEmail(email: string): Promise<void> {

        const key = `${this.prefix}${email}`;

        await redisClient.del(key);
    }
}