
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IPasswordResetTokenRepository } from "../../../domain/repositories/IPasswordResetTokenRepository.js";
import { IPasswordResetTokenService } from "../../contracts/IPasswordResetTokenService.js";
import { IPasswordHasher } from "../../contracts/IPasswordHasher.js";
import { IResetPasswordUseCase } from "../../interfaces/IResetPasswordUseCase.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";

export class ResetPasswordUseCase implements IResetPasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly resetTokenRepository: IPasswordResetTokenRepository,
        private readonly resetTokenService: IPasswordResetTokenService,
        private readonly passwordHasher: IPasswordHasher
    ) { }

    async execute(
        resetToken: string,
        newPassword: string
    ): Promise<{ message: string }> {

        if (!resetToken?.trim() || !newPassword) {
            throw new BadRequest(
                "Reset token and new password are required",
                "RESET_TOKEN_AND_PASSWORD_REQUIRED"
            );
        }

        if (newPassword.length < 8) {
            throw new BadRequest(
                "Password must contain at least 8 characters",
                "INVALID_PASSWORD"
            );
        }

        const tokenHash =
            await this.resetTokenService.hashResetToken(resetToken);

        const authorization =
            await this.resetTokenRepository.findByTokenHash(tokenHash);

        if (!authorization) {
            throw new BadRequest(
                "Invalid or expired reset token",
                "INVALID_RESET_TOKEN"
            );
        }

        if (authorization.expiresAt.getTime() <= Date.now()) {
            await this.resetTokenRepository.consume(tokenHash);

            throw new BadRequest(
                "Reset token has expired",
                "RESET_TOKEN_EXPIRED"
            );
        }

        const user = await this.userRepository.findbyemail(
            authorization.email
        );

        if (!user) {
            await this.resetTokenRepository.consume(tokenHash);

            throw new BadRequest(
                "Unable to reset password",
                "PASSWORD_RESET_FAILED"
            );
        }

        const hashedPassword =
            await this.passwordHasher.hash(newPassword);


        const consumed =
            await this.resetTokenRepository.consume(tokenHash);

        if (!consumed) {
            throw new BadRequest(
                "Reset token is invalid or has already been used",
                "RESET_TOKEN_ALREADY_USED"
            );
        }
        if (!user.userId) {
            throw new BadRequest(
                "User ID is missing",
                "USER_ID_MISSING"
            );
        }
        const updatedUser = await this.userRepository.updatePassword(
            user.userId,
            hashedPassword
        );

        if (!updatedUser) {
            throw new BadRequest(
                "Unable to update password",
                "PASSWORD_UPDATE_FAILED"
            );
        }

        await this.resetTokenRepository.delete(authorization.email);

        return {
            message: "Password reset successfully"
        };
    }
}
