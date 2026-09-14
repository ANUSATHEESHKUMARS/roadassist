import { BadRequest } from "../../shared/errors/BadRequestError.js"
import { RegisterUserDto } from "../dtos/user.js"
import { IRegisterUserValidator } from "./interfaces/IRegisterUserValidator.js"

export class RegisterUserValidator implements IRegisterUserValidator {
    validate(registerUserDto: RegisterUserDto): void {
        if (!registerUserDto.fullName?.trim()) {
            throw new Error("Full name is required")
        }
        if (registerUserDto.fullName.trim().length <= 3) {
            throw new BadRequest("Full name must contain at least 3 characters.", 'FULL_NAME_REQUIRED')
        }
        //for email validaion
        if (!registerUserDto.email?.trim()) {
            throw new BadRequest("email should not be empty", "EMAIL_REQUIRED")
        }
        if (registerUserDto.email.length > 100) {
            throw new BadRequest("Email must not exceed 100 characters..", "EMAIL_SHOULD_HAVE_FORMAT")
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerUserDto.email.trim())) {
            throw new BadRequest("Invalid email format.", "EMAIL_SYNTAX_WRONG")
        }
        //phone number validation
        if (!registerUserDto.phoneNumber?.trim()) {
            throw new BadRequest('Phone number is required', "PHONE_NUMBER_HAVE_DIGITS")
        }
       const phoneRegex = /^\+91\d{10}$/;

if (!phoneRegex.test(registerUserDto.phoneNumber.trim())) {
    throw new BadRequest(
        "Invalid Indian phone number.",
        "PHONE_NUMBER_INVALID"
    );
}
        if (!registerUserDto.password?.trim()) {
            throw new BadRequest(
                "Password is required.",
                "PASSWORD_REQUIRED"
            );
        }

        if (registerUserDto.password.length < 8) {
            throw new BadRequest(
                "Password must contain at least 8 characters.",
                "PASSWORD_MIN_LENGTH"
            );
        }

    }
}

