import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError{
    constructor(message : "Forbidden" , code = "FORBIDDEN"){
    super(message, 403,code )
    

    }
}