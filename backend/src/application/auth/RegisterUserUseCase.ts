
import { IPasswordHasher } from "../contracts/IPasswordHasher.js";
import { IRegisterUserUseCase } from "../interfaces/IRegisterUserUseCase.js";
import { RegisterUserDto } from "../dtos/user.js";
import { IUserRepository } from "../../domain/User/repositories/IUserRepository.js";
import { IRegisterUserValidator } from "../validators/interfaces/IRegisterUserValidator.js";
import { User } from "../../domain/User/entities/User.js";
import { ISendOtpUserUseCase } from "../interfaces/ISendOtpuserUserCase.js";

export class RegisterUserUseCase implements IRegisterUserUseCase {
    constructor(private passwordHasher: IPasswordHasher, 
        private userRepository : IUserRepository,
        private registerUserValidator: IRegisterUserValidator,
        private sendOtpUseCase : ISendOtpUserUseCase
    ){}
    async execute(registerUserDto: RegisterUserDto): Promise<void> {
        console.log('hsjdfhksdfhj')
        this.registerUserValidator.validate(registerUserDto);
        console.log('presnam onnum illaa')
        const existingUser = await this.userRepository.findbyemail(registerUserDto.email)
       
        if(existingUser){
            throw new Error("user alredy exists")
        }
        console.log('hello')
        const hashedPassword = await this.passwordHasher.hash(registerUserDto.password)
          console.log('Validation passed')
          console.log(registerUserDto)
          const user = new User(
            registerUserDto.fullName,
            registerUserDto.email,
            registerUserDto.phoneNumber,
           hashedPassword,
           "user"
          )
          await this.userRepository.save(user)
          await this.sendOtpUseCase.execute(user.userId , user.email , "EMAIL_VERIFICATION")
          

    } 
} 


