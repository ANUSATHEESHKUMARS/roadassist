import { IRegisterUserUseCase } from "../../application/interfaces/IRegisterUserUseCase.js";
import { Request , Response } from "express";
import { LoginUserDTO, RegisterUserDto } from "../../application/dtos/user.js";
import { IAuthController } from "../interfaces/IAuthController.js";
import { ILoginUserUserCase } from "../../application/interfaces/ILoginUserUserCase.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";


export class AuthController implements IAuthController {
  constructor(private registerUserUseCase : IRegisterUserUseCase,
    private loginUserUseCase : ILoginUserUserCase
  ){}
    
    register = async (req: Request, res:Response) : Promise<void> => { 
      console.log('this is controller' ,req.body)
       const registerUserDto : RegisterUserDto = req.body;
      const otp =  await this.registerUserUseCase.execute(registerUserDto);
       res.status(HttpStatusCode.OK).json({
        message : "Register succesfull, otp sent to your email", otp
       })
    }
    login = async (req: Request, res: Response): Promise<void> =>{
      const loginUserDto : LoginUserDTO = req.body
  
      const result = await this.loginUserUseCase.execute(loginUserDto)

      res.cookie("accessToken", result.accessToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge: 15 * 60 * 1000
      })
     
      res.cookie("refreshtoken",result.refreshToken,{
        httpOnly:true,
        secure : process.env.NODE_ENV === "production",
        sameSite:"strict",
        maxAge : 7 * 24 * 60 * 60 *  1000
      })
      res.status(HttpStatusCode.OK).json({
        message : "Login succesfull",
        succes : true
      })
    }
}

