
export interface IPasswordResetTokenRepository {
    save(
        email: string,
        tokenHash: string,
        expiresAt: Date
    ): Promise<void>;

    findByTokenHash(tokenHash: string): Promise<{
        email: string;
        expiresAt: Date;
    } | null>;

    consume(tokenHash: string): Promise<boolean>;

    delete(email: string): Promise<void>;
}
