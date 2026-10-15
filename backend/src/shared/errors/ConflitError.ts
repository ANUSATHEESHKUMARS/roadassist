import { AppError } from "./AppError.js";

export class ConflictError extends AppError{
    constructor(message : string , code = "CONFLICT"){
        super(message, 404, code)
    }
}