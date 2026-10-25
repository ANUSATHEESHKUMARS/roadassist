
import { IOtpRepository } from "../../../domain/repositories/IOtpRepository.js";
import { IOtpService } from "../../contracts/IOtpService.js";
import { IVerifyPasswordResetOtpUseCase } from "../../interfaces/IVerifyPasswordResetOtpUseCase.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { IPasswordResetTokenService } from "../../contracts/IPasswordResetTokenService.js";
import { IPasswordResetTokenRepository } from "../../../domain/repositories/IPasswordResetTokenRepository.js";

export class VerifyPasswordResetOtpUseCase
    implements IVerifyPasswordResetOtpUseCase {

    constructor(
        private readonly otpRepository: IOtpRepository,
        private readonly otpService: IOtpService,
        private readonly passwordResetTokenService: IPasswordResetTokenService,
        private readonly passwordResetTokenRepository: IPasswordResetTokenRepository
    ) { }

    async execute(
        email: string,
        otp: string
    ): Promise<{ message: string; resetToken: string }> {

        const normalizedEmail = email?.trim().toLowerCase();

        if (!normalizedEmail || !otp) {
            throw new BadRequest(
                "Email and OTP are required",
                "EMAIL_AND_OTP_REQUIRED"
            );
        }

        const otpRecord =
            await this.otpRepository.findByEmailAndPurpose(
                normalizedEmail,
                "PASSWORD_RESET"
            );

        if (!otpRecord) {
            throw new BadRequest(
                "Invalid or expired OTP",
                "INVALID_OTP"
            );
        }

        if (otpRecord.expiresAt.getTime() <= Date.now()) {
            await this.otpRepository.markAsUsed(
                normalizedEmail,
                "PASSWORD_RESET"
            );

            throw new BadRequest(
                "OTP has expired",
                "OTP_EXPIRED"
            );
        }

        if (otpRecord.attempts >= 5) {
            throw new BadRequest(
                "Maximum OTP attempts exceeded",
                "OTP_ATTEMPTS_EXCEEDED"
            );
        }

        const isValid = await this.otpService.compareOtp(
            otp,
            otpRecord.codeHash
        );

        if (!isValid) {
            await this.otpRepository.incrementAttemps(
                normalizedEmail,
                "PASSWORD_RESET"
            );

            throw new BadRequest(
                "Invalid OTP",
                "INVALID_OTP"
            );
        }

        await this.otpRepository.markAsUsed(
            normalizedEmail,
            "PASSWORD_RESET"
        );

        const resetToken =
            await this.passwordResetTokenService.generateResetToken();

        const tokenHash =
            await this.passwordResetTokenService.hashResetToken(resetToken);

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.passwordResetTokenRepository.save(
            normalizedEmail,
            tokenHash,
            expiresAt
        );

        return {
            message: "OTP verified successfully",
            resetToken
        };
    }
}
