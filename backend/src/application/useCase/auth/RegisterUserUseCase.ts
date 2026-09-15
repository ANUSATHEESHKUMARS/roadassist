
import { IPasswordHasher } from "../../contracts/IPasswordHasher.js";
import { IRegisterUserUseCase } from "../../interfaces/IRegisterUserUseCase.js";
import { RegisterUserDto } from "../../dtos/user.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IRegisterUserValidator } from "../../validators/interfaces/IRegisterUserValidator.js";
import { ISendOtpUserUseCase } from "../../interfaces/ISendOtpuserUserCase.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { IPendingRegistrationRepository } from "../../../domain/repositories/IPendingRegistration.js";
import { PendingRegistration } from "../../../domain/User/entities/PendingRegistration.js";


export class RegisterUserUseCase implements IRegisterUserUseCase {

    constructor(
        private passwordHasher: IPasswordHasher,
        private userRepository: IUserRepository,
        private registerUserValidator: IRegisterUserValidator,
        private sendOtpUseCase: ISendOtpUserUseCase,
        private pendingRegistrationRepository: IPendingRegistrationRepository
    ) { }
    async execute(registerUserDto: RegisterUserDto): Promise<{ message: string; }> {

        this.registerUserValidator.validate(registerUserDto);

        console.log("2. AFTER VALIDATOR");

console.log("3. BEFORE FIND BY EMAIL");
        const existingUser = await this.userRepository.findbyemail(
            registerUserDto.email
        );
        console.log("4. AFTER FIND BY EMAIL");
console.log("EMAIL CHECKED:", registerUserDto.email);
console.log("EXISTING USER:", existingUser);



        if (existingUser) {
            console.log("USER ALREADY EXISTS");
            throw new ConflictError(
                "user already exists",
                "USER_ALREADY_EXISTS"
            );
        }

        const hashedPassword = await this.passwordHasher.hash(
            registerUserDto.password
        );
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000)


        const pendingRegistration = new PendingRegistration(
            registerUserDto.fullName,
            registerUserDto.email,
            registerUserDto.phoneNumber,
            hashedPassword,
            expiresAt
        )


        await this.pendingRegistrationRepository.save(pendingRegistration)

        await this.sendOtpUseCase.execute(registerUserDto.email, "EMAIL_VERIFICATION")

        return {
            message: "Registration succesfull and otp sent to your sent "
        }
    }
}




