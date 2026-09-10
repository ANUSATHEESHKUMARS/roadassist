import { RegisterUserDto } from "../../dtos/user.js";
export interface IRegisterUserValidator {
    validate(registerUserDto: RegisterUserDto):void;
}