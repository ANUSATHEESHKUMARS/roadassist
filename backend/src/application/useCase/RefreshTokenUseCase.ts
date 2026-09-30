import { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { ITokenService } from "../contracts/ITokenService.js";
import { IRefreshTokenUseCase } from "../interfaces/IRefreshTokenUseCase.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";


export class RefreshTokenUseCase implements IRefreshTokenUseCase {

    constructor(
        private userRepository: IUserRepository,
        private tokenService: ITokenService
    ) { }

    async execute(refreshToken: string): Promise<string> {

        if (!refreshToken) {
            throw new UnauthorizedError(
                "Refresh token required",
                "REFRESH_TOKEN_REQUIRED"
            );
        }

        const payload = this.tokenService.verifyRefreshToken(refreshToken);

        const user = await this.userRepository.findById(payload.userId);

        if (!user) {
            throw new UnauthorizedError(
                "User not found",
                "USER_NOT_FOUND"
            );
        }

        const accessToken = this.tokenService.generateAccessToken({
            userId: user.userId!,
            email: user.email,
            role: user.role
        });

        return accessToken;
    }
}