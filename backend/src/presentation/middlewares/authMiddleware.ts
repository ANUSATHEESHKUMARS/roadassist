
import { Request, Response, NextFunction } from "express";

import { ITokenService } from "../../application/contracts/ITokenService.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
import { ForbiddenError } from "../../shared/errors/ForbiddenError.js";
import { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export const authMiddleware = (
    tokenService: ITokenService,
    userRepository: IUserRepository
) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            // 1. Get access token
            const token = req.cookies?.accessToken;

            if (!token) {
                throw new UnauthorizedError(
                    "Authentication required",
                    "AUTHENTICATION_REQUIRED"
                );
            }

            // 2. Verify access token
            let payload;

            try {
                payload = tokenService.verifyAccessToken(token);
            } catch {
                throw new UnauthorizedError(
                    "Invalid or expired access token",
                    "INVALID_ACCESS_TOKEN"
                );
            }

            // 3. Validate user ID
            if (!payload.userId) {
                throw new UnauthorizedError(
                    "Invalid access token",
                    "INVALID_ACCESS_TOKEN"
                );
            }

            // 4. Fetch latest user from database
            const user = await userRepository.findById(payload.userId);

            if (!user) {
                throw new UnauthorizedError(
                    "User account not found",
                    "USER_NOT_FOUND"
                );
            }

            // 5. Check account status
            if (user.status !== "active") {
                throw new ForbiddenError(
                    "Your account has been blocked. Please contact support.",
                    "ACCOUNT_BLOCKED"
                );
            }

            // 6. Validate active role
            if (!user.roles.includes(user.activeRole)) {
                throw new ForbiddenError(
                    "Invalid active role",
                    "INVALID_ACTIVE_ROLE"
                );
            }

            // 7. Attach latest user information
            req.user = {
                userId: user.userId!,
                email: user.email,
                roles: user.roles,
                activeRole: user.activeRole
            };

            return next();

        } catch (error) {
            return next(error);
        }
    };
};
