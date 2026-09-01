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
        console.log('helloo worlkddfkfskdfjkdsj')
       const registerUserDto : RegisterUserDto = req.body;
       console.log('register dbt' , registerUserDto)
       await this.registerUserUseCase.execute(registerUserDto);
       
       res.status(HttpStatusCode.OK).json({
        message : "Register succesfull, otp sent to your email"
       })
    }
    login = async (req: Request, res: Response): Promise<void> =>{
      const loginUserDto : LoginUserDTO = req.body
      console.log("this is the data",loginUserDto, req.body)
      const token = await this.loginUserUseCase.execute(loginUserDto)
      res.status(HttpStatusCode.OK).json({
        message : "Login succesfull",
        token
      })
       
    }
}

