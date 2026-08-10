import { RegisterUserDto } from "../../dtos/RegisterUserDTO.js";

export interface IRegisterUserValidator {
    validate(registerUserDto: RegisterUserDto):void;
}