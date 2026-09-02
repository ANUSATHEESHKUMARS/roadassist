import { IUserRepository } from "../../domain/User/repositories/IUserRepository.js";
import { UnauthorizedError } from "../../shared/errors/UnauthorizedError.js";
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
            throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS")
        }
       const isValidPassword = await this.passwordHasher.compare(loginUserDto.password , user.getpassword())
       if(!isValidPassword){
        throw new UnauthorizedError("invalid credentials ...", "INVALID_CREATEDTIALS")
       }
       const token =  this.tokenService.generateToken({
        userId : user.userId,
        email : user.email,
        role: user.role

       })
       return token
     }
}

