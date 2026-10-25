
export interface IPasswordResetTokenService {
    generateResetToken(): Promise<string>;

    hashResetToken(token: string): Promise<string>;

    verifyResetToken(
        token: string,
        hashedToken: string
    ): Promise<boolean>;
}
