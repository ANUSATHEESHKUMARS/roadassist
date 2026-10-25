
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js"
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js"
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js"
import { IPasswordHasher } from "../../contracts/IPasswordHasher.js"
import { ITokenService } from "../../contracts/ITokenService.js"
import { LoginUserDTO } from "../../dtos/user.js"
import { ILoginUserUserCase } from "../../interfaces/ILoginUserUserCase.js"


export class LoginUserUseCase implements ILoginUserUserCase {
    constructor(private userRepository: IUserRepository,
        private passwordHasher: IPasswordHasher,
        private tokenService: ITokenService
    ) { }

    async execute(loginUserDto: LoginUserDTO): Promise<{ accessToken: string, refreshToken: string }> {
        const user = await this.userRepository.findbyemail(loginUserDto.email)
        console.log("LOGIN EMAIL:", loginUserDto.email);
        console.log("USER FOUND:", !!user);
        console.log("USER STATUS:", user?.status);
        if (!user) {
            throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS")
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

        console.log("PASSWORD VALID:", isValidPassword);

        if (!isValidPassword) {
            throw new UnauthorizedError("invalid credentials ...", "INVALID_CREATEDTIALS")
        }
        console.log("CHECKING BLOCK STATUS:", user.status);

        if (user.status === 'blocked') {
            throw new ForbiddenError("Your account has been blocked .Plese contact support", "ACCOUNT_BLOCKED")
        }
        const accessToken = this.tokenService.generateAccessToken({
            userId: user.userId!,
            email: user.email,
            role: user.role

        })


        const refreshToken = this.tokenService.generateRefreshToken({
            userId: user.userId!
        })
        console.log("ACCESS TOKEN GENERATED");
        console.log("REFRESH TOKEN GENERATED");
        return {
            accessToken,
            refreshToken
        }
    }
}

