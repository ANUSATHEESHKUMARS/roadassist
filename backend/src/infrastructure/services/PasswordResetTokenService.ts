
import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

import { IPasswordResetTokenService } from "../../application/contracts/IPasswordResetTokenService.js";

export class PasswordResetTokenService
    implements IPasswordResetTokenService {

    async generateResetToken(): Promise<string> {
        return randomBytes(32).toString("hex");
    }

    async hashResetToken(token: string): Promise<string> {
        return createHash("sha256")
            .update(token)
            .digest("hex");
    }

    async verifyResetToken(
        token: string,
        hashedToken: string
    ): Promise<boolean> {
        const tokenHash = await this.hashResetToken(token);

        const tokenBuffer = Buffer.from(tokenHash, "hex");
        const storedBuffer = Buffer.from(hashedToken, "hex");

        if (
            tokenBuffer.length !== storedBuffer.length ||
            tokenBuffer.length === 0
        ) {
            return false;
        }

        return timingSafeEqual(tokenBuffer, storedBuffer);
    }
}
