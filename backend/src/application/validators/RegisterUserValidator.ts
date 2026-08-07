import { RegisterUserDto } from '../auth/dtos/RegisterUserDTO.js'

export class RegisterUserValidator {
    validate(registerUserDto: RegisterUserDto): void{
        if(!registerUserDto.fullName.trim()){
             throw new Error("Full name is required")
        }
        if(registerUserDto.fullName.trim().length <= 3){
            throw new Error("Full name must contain at least 3 characters.")
        }
        //for email validaion
        if(!registerUserDto.email.trim()){
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
        if(!registerUserDto.phoneNumber.trim()){
            throw new Error('')
        }
        
    }
}