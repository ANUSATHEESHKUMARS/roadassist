import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../application/contracts/ITokenService.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
import { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export const authMiddleware = (tokenService: ITokenService, userRepository: IUserRepository) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const token = req.cookies?.accessToken

        if (!token) {
            return next(new UnauthorizedError("Authentication required", "AUTHENTICATION_REQUIRED")
            );
        }

        let payload;
        try {
            payload = tokenService.verifyAccessToken(token)

        } catch {
            return next(new UnauthorizedError("Invalid or expired access token", "INVALID_ACCESS_TOKEN"))
        }
        const userId = payload.userId

        if (!userId) {
            return next(new UnauthorizedError("Invalid access token",
                "INVALID_ACCESS_TOKEN"
            ))

        }
        try {

            const user = await userRepository.findById(userId)
            if (!user) {
                return next(new UnauthorizedError("User accound not found", "USER_NOT_FOUND"))

            }

            if (user.status === "blocked") {
                return next(new UnauthorizedError("Your accound has been blocked", "ACCOUNT_BLOCKED"))

            }
            req.user = payload
            return next()

        } catch (error) {
            return next(error)
        }
    }
} 