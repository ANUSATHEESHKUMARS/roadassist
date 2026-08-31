import { RegisterUserDto } from "../dtos/user.js"

export interface IRegisterUserUseCase { 
    execute(registerUserDto: RegisterUserDto): Promise<void>
}
