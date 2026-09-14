import { IGoogleAuthService } from "../../contracts/IGoogleAuthService.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { ITokenService } from "../../contracts/ITokenService.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { IGoogleLoginUseCase } from "../../interfaces/IGoogleLoginUseCase.js";


export class GoogleLoginUseCase implements IGoogleLoginUseCase {

    constructor(
        private readonly googleAuthService: IGoogleAuthService,
        private readonly userRepository: IUserRepository,
        private readonly tokenService: ITokenService
    ) {}

    async execute(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {

        const googleUser =
            await this.googleAuthService.verifyIdToken(idToken);

        if (!googleUser.emailVerified) {
            throw new UnauthorizedError(
                "Google email is not verified",
                "GOOGLE_EMAIL_NOT_VERIFIED"
            );
        }

        let user =
            await this.userRepository.findbyemail(
                googleUser.email
            );

        if (!user) {
            user =
                await this.userRepository.createGoogleUser({
                    fullName: googleUser.fullName,
                    email: googleUser.email,
                    googleId: googleUser.googleId
                });
        }

        const accessToken =
            this.tokenService.generateAccesToken({
                userId: user.userId!,
                email: user.email,
                role: user.role
            });

        const refreshToken =
            this.tokenService.generateRefreshToken({
                userId: user.userId!
            });

        return {
            accessToken,
            refreshToken
        };
    }
}