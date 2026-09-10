
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js"
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js"
import { IPasswordHasher } from "../../contracts/IPasswordHasher.js"
import { ITokenService } from "../../contracts/ITokenService.js"
import { LoginUserDTO } from "../../dtos/user.js"
import { ILoginUserUserCase } from "../../interfaces/ILoginUserUserCase.js"


export class LoginUserUseCase implements ILoginUserUserCase {
    constructor(private userRepository:IUserRepository,
      private passwordHasher : IPasswordHasher,
      private tokenService : ITokenService
    ){}

     async execute(loginUserDto : LoginUserDTO): Promise<{accessToken : string, refreshToken: string}>{
        const user = await this.userRepository.findbyemail(loginUserDto.email)
        if(!user){
            throw new UnauthorizedError("Invalid email or password", "INVALID_CREDENTIALS")
        }
       const isValidPassword = await this.passwordHasher.compare(loginUserDto.password , user.getpassword())
       if(!isValidPassword){
        throw new UnauthorizedError("invalid credentials ...", "INVALID_CREATEDTIALS")
       }
       const accessToken =  this.tokenService.generateAccesToken({
        userId : user.userId!,
        email : user.email,
        role: user.role

       }) 

       console.log('acces token is this bro' , accessToken)
    
       const refreshToken = this.tokenService.generateRefreshToken({
        userId : user.userId!
       })

       return {
        accessToken,
        refreshToken
       }
     }
}

