import { AppError } from "./AppError.js";

export class NotfoundError extends AppError{
    constructor(message : string , code = "NOT_FOUND"){
        super(message , 404, code)
    }
}