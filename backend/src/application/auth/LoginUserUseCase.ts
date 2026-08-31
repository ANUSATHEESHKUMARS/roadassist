import { IUserRepository } from "../../domain/User/repositories/IUserRepository.js";
import { IPasswordHasher } from "../contracts/IPasswordHasher.js";
import { ITokenService } from "../contracts/ITokenService.js";
import { LoginUserDTO } from "../dtos/user.js";
import { ILoginUserUserCase } from "../interfaces/ILoginUserUserCase.js";

export class LoginUserUseCase implements ILoginUserUserCase {
    constructor(private userRepository:IUserRepository,
      private passwordHasher : IPasswordHasher,
      private tokenService : ITokenService
    ){}
     async execute(loginUserDto : LoginUserDTO): Promise<string>{
        const user = await this.userRepository.findbyemail(loginUserDto.email)
        if(!user){
            throw new Error("Invalid email or password")
        }
       const isValidPassword = await this.passwordHasher.compare(loginUserDto.password , user.getpassword())
       if(!isValidPassword){
        throw new Error("invalid credentials ...")
       }
       const token =  this.tokenService.generateToken({
        userId : user.userId,
        email : user.email,
        role: user.role

       })
       return token
     }
}

