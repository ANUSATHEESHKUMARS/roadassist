import { BadRequest } from "../../shared/errors/BadRequestError.js";
import { RegisterUserDto } from "../dtos/user.js";
import { IRegisterUserValidator } from "./interfaces/IRegisterUserValidator.js";

export class RegisterUserValidator implements IRegisterUserValidator {

    validate(registerUserDto: RegisterUserDto): void {

   
        const fullName = registerUserDto.fullName?.trim();

        if (!fullName) {
            throw new BadRequest(
                "Full name is required.",
                "FULL_NAME_REQUIRED"
            );
        }

        if (fullName.length < 3) {
            throw new BadRequest(
                "Full name must contain at least 3 characters.",
                "FULL_NAME_MIN_LENGTH"
            );
        }

        if (fullName.length > 50) {
            throw new BadRequest(
                "Full name must not exceed 50 characters.",
                "FULL_NAME_MAX_LENGTH"
            );
        }

        const nameRegex = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

        if (!nameRegex.test(fullName)) {
            throw new BadRequest(
                "Full name can contain only letters, spaces, hyphens, and apostrophes.",
                "FULL_NAME_INVALID"
            );
        }



        const email = registerUserDto.email?.trim();

        if (!email) {
            throw new BadRequest(
                "Email is required.",
                "EMAIL_REQUIRED"
            );
        }

        if (email.length > 100) {
            throw new BadRequest(
                "Email must not exceed 100 characters.",
                "EMAIL_MAX_LENGTH"
            );
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            throw new BadRequest(
                "Invalid email format.",
                "EMAIL_INVALID"
            );
        }




        const phoneNumber = registerUserDto.phoneNumber?.trim();

        if (!phoneNumber) {
            throw new BadRequest(
                "Phone number is required.",
                "PHONE_NUMBER_REQUIRED"
            );
        }

        const phoneRegex = /^[6-9]\d{9}$/;

        if (!phoneRegex.test(phoneNumber)) {
            throw new BadRequest(
                "Phone number must be a valid 10-digit Indian mobile number.",
                "PHONE_NUMBER_INVALID"
            );
        }


   

        const password = registerUserDto.password;

        if (!password?.trim()) {
            throw new BadRequest(
                "Password is required.",
                "PASSWORD_REQUIRED"
            );
        }

        if (password.length < 8) {
            throw new BadRequest(
                "Password must contain at least 8 characters.",
                "PASSWORD_MIN_LENGTH"
            );
        }

        if (password.length > 64) {
            throw new BadRequest(
                "Password must not exceed 64 characters.",
                "PASSWORD_MAX_LENGTH"
            );
        }

        if (!/[A-Z]/.test(password)) {
            throw new BadRequest(
                "Password must contain at least one uppercase letter.",
                "PASSWORD_UPPERCASE_REQUIRED"
            );
        }

        if (!/[a-z]/.test(password)) {
            throw new BadRequest(
                "Password must contain at least one lowercase letter.",
                "PASSWORD_LOWERCASE_REQUIRED"
            );
        }

        if (!/[0-9]/.test(password)) {
            throw new BadRequest(
                "Password must contain at least one number.",
                "PASSWORD_NUMBER_REQUIRED"
            );
        }

        if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\];'/+=~`]/.test(password)) {
            throw new BadRequest(
                "Password must contain at least one special character.",
                "PASSWORD_SPECIAL_CHARACTER_REQUIRED"
            );
        }
    }
}