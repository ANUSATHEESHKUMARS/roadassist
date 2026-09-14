
import { IPasswordHasher } from "../../contracts/IPasswordHasher.js";
import { IRegisterUserUseCase } from "../../interfaces/IRegisterUserUseCase.js";
import { RegisterUserDto } from "../../dtos/user.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { IRegisterUserValidator } from "../../validators/interfaces/IRegisterUserValidator.js";
import { User } from "../../../domain/User/entities/User.js";
import { ISendOtpUserUseCase } from "../../interfaces/ISendOtpuserUserCase.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";


export class RegisterUserUseCase implements IRegisterUserUseCase {
    constructor(private passwordHasher: IPasswordHasher, 
        private userRepository : IUserRepository,
        private registerUserValidator: IRegisterUserValidator,
        private sendOtpUseCase : ISendOtpUserUseCase
    ){}
    async execute(registerUserDto: RegisterUserDto): Promise<{message : string ;}> {
  console.log("EMAIL INSIDE USE CASE:", registerUserDto.email)

console.log("🔥 ABOUT TO CALL VALIDATOR")

        this.registerUserValidator.validate(registerUserDto);

console.log("🔥 VALIDATOR COMPLETED")

console.log("🔥 ABOUT TO CALL FIND BY EMAIL")
      const existingUser = await this.userRepository.findbyemail(
    registerUserDto.email
);
console.log("🔥 FIND BY EMAIL COMPLETED")
console.log("EXISTING USER:", existingUser)

if (existingUser) {
    console.log("USER ALREADY EXISTS");
    throw new ConflictError(
        "user already exists",
        "USER_ALREADY_EXISTS"
    );
}

console.log("NO EXISTING USER");
const hashedPassword = await this.passwordHasher.hash(
    registerUserDto.password
);

console.log("8. PASSWORD HASH COMPLETED");        

        console.log("7. PASSWORD HASHED");

          console.log('Validation passed')
          console.log(registerUserDto)
          const user = new User(
            registerUserDto.fullName,
            registerUserDto.email,
            registerUserDto.phoneNumber,
           hashedPassword,
           "user",
           
          )
           const  savedUser =  await this.userRepository.save(user)

          console.log("8. USER SAVED", savedUser);

console.log("9. BEFORE OTP");
       const otpResponse =  await this.sendOtpUseCase.execute(savedUser.userId , savedUser.email , "EMAIL_VERIFICATION")
       console.log(otpResponse ,"otp completed" )
          return {message : "success " ,
           }

    } 
} 


