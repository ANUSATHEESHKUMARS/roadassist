
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { IPasswordHasher } from "../../contracts/IPasswordHasher.js";
import { ITokenService } from "../../contracts/ITokenService.js";
import { LoginUserDTO } from "../../dtos/user.js";
import { ILoginUserUserCase } from "../../interfaces/ILoginUserUserCase.js";

export class LoginUserUseCase implements ILoginUserUserCase {
    constructor(
        private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private tokenService: ITokenService
    ) {}

    async execute(
        loginUserDto: LoginUserDTO
    ): Promise<{ accessToken: string; refreshToken: string }> {

        const user = await this.userRepository.findbyemail(
            loginUserDto.email
        );

        if (!user) {
            throw new UnauthorizedError(
                "Invalid email or password",
                "INVALID_CREDENTIALS"
            );
        }

        const password = user.getpassword();

        if (!password) {
            throw new UnauthorizedError(
                "Invalid email or password",
                "INVALID_CREDENTIALS"
            );
        }

        const isValidPassword = await this.passwordHasher.compare(
            loginUserDto.password,
            password
        );

        if (!isValidPassword) {
            throw new UnauthorizedError(
                "Invalid email or password",
                "INVALID_CREDENTIALS"
            );
        }

        if (user.status !== "active") {
            throw new ForbiddenError(
                "Your account has been blocked. Please contact support.",
                "ACCOUNT_BLOCKED"
            );
        }

        // Validate role information
        if (
            !user.roles.length ||
            !user.roles.includes(user.activeRole)
        ) {
            throw new ForbiddenError(
                "Invalid account role configuration",
                "INVALID_ROLE_CONFIGURATION"
            );
        }

        const accessToken = this.tokenService.generateAccessToken({
            userId: user.userId!,
            email: user.email,
            roles: user.roles,
            activeRole: user.activeRole
        });

        const refreshToken = this.tokenService.generateRefreshToken({
            userId: user.userId!
        });

        return {
            accessToken,
            refreshToken
        };
    }
}
