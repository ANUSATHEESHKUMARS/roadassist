
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
            const token = req.cookies?.accessToken;


            console.log("REST authentication:");
            console.log("Cookie received:", !!req.headers.cookie);
            console.log("Access token received:", !!token);

            if (!token) {
                throw new UnauthorizedError(
                    "Authentication required",
                    "AUTHENTICATION_REQUIRED"
                );
            }

            let payload;

            try {
                payload = tokenService.verifyAccessToken(token);
                console.log("Access token valid");
                console.log("Payload:", payload);
            } catch {
                throw new UnauthorizedError(
                    "Invalid or expired access token",
                    "INVALID_ACCESS_TOKEN"
                );
            }

            if (!payload.userId) {
                throw new UnauthorizedError(
                    "Invalid access token",
                    "INVALID_ACCESS_TOKEN"
                );
            }

            const user = await userRepository.findById(payload.userId);

            if (!user) {
                throw new UnauthorizedError(
                    "User account not found",
                    "USER_NOT_FOUND"
                );
            }

            if (user.status !== "active") {
                throw new ForbiddenError(
                    "Your account has been blocked. Please contact support.",
                    "ACCOUNT_BLOCKED"
                );
            }

            if (!user.roles.includes(user.activeRole)) {
                throw new ForbiddenError(
                    "Invalid active role",
                    "INVALID_ACTIVE_ROLE"
                );
            }

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
