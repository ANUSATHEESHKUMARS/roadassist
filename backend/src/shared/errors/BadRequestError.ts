import { AppError } from "./AppError.js";

export class BadRequest extends AppError {
    constructor(message : string , code = "BAD_REQUEST"){
        super(message , 400 , code)
    }
}