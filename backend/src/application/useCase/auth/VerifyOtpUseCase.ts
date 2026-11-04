
import { IOtpRepository } from "../../../domain/repositories/IOtpRepository.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IOtpService } from "../../contracts/IOtpService.js";
import { IVerifyOtpUseCase } from "../../interfaces/IVerifyOtp.js";
import { otpDto } from "../../dtos/otp.js";
import { IPendingRegistrationRepository } from "../../../domain/repositories/IPendingRegistration.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User } from "../../../domain/User/entities/User.js";
import { ITokenService } from "../../contracts/ITokenService.js";

export class VerifyOtpUseCase implements IVerifyOtpUseCase {

    constructor(
        private otpRepository: IOtpRepository,
        private otpService: IOtpService,
        private pendingRegistrationRepository: IPendingRegistrationRepository,
        private userRepository: IUserRepository,
        private tokenService: ITokenService
    ) {}

    async verify(
        verifyotpDto: otpDto
    ): Promise<{
        message: string;
        accessToken: string;
        refreshToken: string;
    }> {

        const otpRecord = await this.otpRepository.findByEmailAndPurpose(
            verifyotpDto.email,
            verifyotpDto.purpose
        );

        if (!otpRecord) {
            throw new NotfoundError("Otp not found", "OTP_NOT_FOUND");
        }

        if (otpRecord.expiresAt < new Date()) {
            throw new BadRequest("OTP timed out", "OTP_TIME_OUT");
        }

        if (otpRecord.used) {
            throw new BadRequest("OTP has already been used", "OTP_ALREADY_USED");
        }

        if (otpRecord.attempts >= 5) {
            throw new BadRequest("Too many attempts", "TOO_MANY_ATTEMPTS");
        }

        const pendingRegistration =
            await this.pendingRegistrationRepository.findByEmail(
                verifyotpDto.email
            );

        if (!pendingRegistration) {
            throw new NotfoundError(
                "Pending registration not found",
                "PENDING_REGISTRATION_NOT_FOUND"
            );
        }

        const isValid = await this.otpService.compareOtp(
            verifyotpDto.otp,
            otpRecord.codeHash
        );

        if (!isValid) {
            await this.otpRepository.incrementAttemps(
                verifyotpDto.email,
                verifyotpDto.purpose
            );

            throw new BadRequest("Invalid OTP", "INVALID_OTP");
        }

        await this.otpRepository.markAsUsed(
            verifyotpDto.email,
            verifyotpDto.purpose
        );

        // Normal public registrations always create normal users.
        const user = new User(
            pendingRegistration.fullName,
            pendingRegistration.email,
            pendingRegistration.phoneNumber,
            pendingRegistration.getPassword(),
            ["user"],
            undefined,
            undefined,
            "LOCAL",
            "active",
            "user"
        );

        const savedUser = await this.userRepository.save(user);

        const accessToken = this.tokenService.generateAccessToken({
            userId: savedUser.userId!,
            email: savedUser.email,
            roles: savedUser.roles,
            activeRole: savedUser.activeRole
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            userId: savedUser.userId!
        });

        await this.pendingRegistrationRepository.deleteByEmail(
            verifyotpDto.email
        );

        return {
            message: "OTP verification successful",
            accessToken,
            refreshToken
        };
    }
}
