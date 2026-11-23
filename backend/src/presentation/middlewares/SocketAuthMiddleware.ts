
import { parse } from "cookie";
import type { Socket } from "socket.io";

import type { ITokenService } from "../../application/contracts/ITokenService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

export const socketAuthMiddleware = (
    tokenService: ITokenService,
    userRepository: IUserRepository
) => {
    return async (socket: Socket, next: (err?: Error) => void) => {
        try {
            const cookieHeader = socket.handshake.headers.cookie;

            if (!cookieHeader) {
                return next(new Error("Authentication required"));
            }

            const cookies = parse(cookieHeader);
            const token = cookies.accessToken;

            if (!token) {
                return next(new Error("Access token not found"));
            }

            let payload;

            try {
                payload = tokenService.verifyAccessToken(token);
            } catch {
                return next(new Error("Invalid or expired access token"));
            }

            if (!payload.userId) {
                return next(new Error("Invalid access token"));
            }

            const user = await userRepository.findById(payload.userId);

            if (!user) {
                return next(new Error("User account not found"));
            }

            if (user.status !== "active") {
                return next(new Error("Your account is blocked"));
            }

            if (!user.roles.includes(user.activeRole)) {
                return next(new Error("Invalid active role"));
            }

            // Allow only mechanics and customers.
            if (
                user.activeRole !== "mechanic" &&
                user.activeRole !== "user"
            ) {
                return next(new Error("Socket access not allowed"));
            }

            socket.data.userId = user.userId!;
            socket.data.email = user.email;
            socket.data.roles = user.roles;
            socket.data.activeRole = user.activeRole;

            return next();

        } catch (error) {
            console.error("Socket authentication error:", error);
            return next(new Error("Socket authentication failed"));
        }
    };
};
