import { RegisterUserDto } from "../dtos/RegisterUserDTO.js"

export interface IRegisterUserUseCase { 
    execute(registerUserDto: RegisterUserDto): Promise<void>
}