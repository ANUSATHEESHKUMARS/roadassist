import { RegisterUserDto } from "../dtos/user.js"
import { IRegisterUserValidator } from "./interfaces/IRegisterUserValidator.js"

export class RegisterUserValidator implements IRegisterUserValidator{
    validate(registerUserDto: RegisterUserDto): void{
        if(!registerUserDto.fullName?.trim()){
             throw new Error("Full name is required")
        }
        if(registerUserDto.fullName.trim().length <= 3){
            throw new Error("Full name must contain at least 3 characters.")
        }
        //for email validaion
        if(!registerUserDto.email?.trim()){
             throw new Error("email should not be empty")
        }
        if(registerUserDto.email.length > 100){
            throw new Error("Email must not exceed 100 characters..")
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(registerUserDto.email.trim())){
            throw new Error("Invalid email format.")
        }
        //phone number validation
        if(!registerUserDto.phoneNumber?.trim()){
            throw new Error('Phone number is required')
        }
        if(!/^\d{10}$/.test(registerUserDto.phoneNumber.trim())){
            throw new Error("Password is required.")
        }
        if(registerUserDto.password.length < 8){
            throw new Error("Password much contain at least 8 characters..")
        }
        
    }
}

