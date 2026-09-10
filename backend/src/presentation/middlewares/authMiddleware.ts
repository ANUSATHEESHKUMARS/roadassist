import { Request, Response, NextFunction } from "express";
import { ITokenService } from "../../application/contracts/ITokenService.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";


export const authMiddleware = (tokenService: ITokenService) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const token = req.cookies?.accessToken
      
        if (!token) {
            next(new UnauthorizedError("Authentication required", "AUTHENTICATION_REQUIRED")
            );
            return
        }
        try {
            const payload = tokenService.verifyAccesToken(token)
            req.user = payload
            console.log('this is the req', req.user)
            next()

        } catch {
            next(new UnauthorizedError("Invald or expired access token", "INVALID_ACCES_TOKEN"))
        }
    }
}