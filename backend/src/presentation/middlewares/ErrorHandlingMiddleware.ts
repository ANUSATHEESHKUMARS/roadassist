import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../shared/errors/AppError.js'



export const errorHandlingMiddleware = (
    error: unknown,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (error instanceof AppError) {
        res.status(error.statusCode).json({
            succes: false,
            message: error.message,
            code: error.code
        })
        return;
    }
    console.log(error)
    res.status(500).json({
        succes: false,
        message: "Internal server error happens",
        code: "INTERNAL_SERVER_ERROR"
    })
}

