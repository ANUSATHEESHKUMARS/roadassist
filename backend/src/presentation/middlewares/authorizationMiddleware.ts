
import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../../shared/errors/ForbiddenError.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
import { UserRole } from "../../domain/User/entities/User.js";

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {

        if (!req.user) {
            next(
                new UnauthorizedError(
                    "Authentication required",
                    "AUTHENTICATION_REQUIRED"
                )
            );
            return;
        }

        const hasPermission = allowedRoles.some(role => req.user!.roles.includes(role))

        if (!hasPermission) {
            next(
                new ForbiddenError(
                    "You do not have permission to access this resource",
                    "FORBIDDEN"
                )
            );
            return;
        }

        next();
    };
};
