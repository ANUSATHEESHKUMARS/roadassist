import redisClient from "../redis.js";
import { IPasswordResetTokenRepository } from "../../domain/repositories/IPasswordResetTokenRepository.js";

export class RedisPasswordResetTokenRepository
    implements IPasswordResetTokenRepository {

    private readonly prefix = "password-reset:";
    private readonly tokenPrefix = "password-reset-token:";

    async save(
        email: string,
        tokenHash: string,
        expiresAt: Date
    ): Promise<void> {
        const emailKey = `${this.prefix}${email}`;
        const tokenKey = `${this.tokenPrefix}${tokenHash}`;
        const ttl = Math.ceil(
            (expiresAt.getTime() - Date.now()) / 1000
        );

        if (ttl <= 0) {
            throw new Error("Password reset token has expired");
        }

        await redisClient.set(
            emailKey,
            JSON.stringify({ tokenHash, expiresAt }),
            { EX: ttl }
        );

        await redisClient.set(
            tokenKey,
            JSON.stringify({ email, expiresAt }),
            { EX: ttl }
        );
    }

    async findByTokenHash(
    tokenHash: string
): Promise<{
    email: string;
    expiresAt: Date;
} | null> {
    const key = `${this.tokenPrefix}${tokenHash}`;

    const data = await redisClient.get(key);

    if (!data) {
        return null;
    }

    const parsed = JSON.parse(data) as {
        email: string;
        expiresAt: string;
    };

    return {
        email: parsed.email,
        expiresAt: new Date(parsed.expiresAt)
    };
}

async consume(tokenHash: string): Promise<boolean> {
    const tokenKey = `${this.tokenPrefix}${tokenHash}`;

    // First get the data so we can also clean up the email key
    const data = await redisClient.get(tokenKey);

    if (!data) {
        return false;
    }

    const parsed = JSON.parse(data) as { email: string };
    const emailKey = `${this.prefix}${parsed.email}`;

    // Delete both keys
    await redisClient.del(tokenKey);
    await redisClient.del(emailKey);

    return true;
}

    async findByEmail(
        email: string
    ): Promise<{
        tokenHash: string;
        expiresAt: Date;
    } | null> {
        const key = `${this.prefix}${email}`;
        const data = await redisClient.get(key);

        if (!data) {
            return null;
        }

        const parsed = JSON.parse(data) as {
            tokenHash: string;
            expiresAt: string;
        };

        return {
            tokenHash: parsed.tokenHash,
            expiresAt: new Date(parsed.expiresAt)
        };
    }

    async delete(email: string): Promise<void> {
        // Also clean up the token key if it exists
        const emailKey = `${this.prefix}${email}`;
        const data = await redisClient.get(emailKey);

        if (data) {
            const parsed = JSON.parse(data) as { tokenHash: string };
            await redisClient.del(`${this.tokenPrefix}${parsed.tokenHash}`);
        }

        await redisClient.del(emailKey);
    }
}

