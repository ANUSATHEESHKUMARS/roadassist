import { IRegisterUserUseCase } from "../../application/interfaces/IRegisterUserUseCase.js";
import { Request , Response } from "express";
import { LoginUserDTO, RegisterUserDto } from "../../application/dtos/user.js";
import { IAuthController } from "../interfaces/IAuthController.js";
import { ILoginUserUserCase } from "../../application/interfaces/ILoginUserUserCase.js";

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
       
       res.status(200).json({
        message : "Register succesfull"
       })
    }
    login = async (req: Request, res: Response): Promise<void> =>{
      const loginUserDto : LoginUserDTO = req.body
      console.log("this is the data",loginUserDto, req.body)
      const token = await this.loginUserUseCase.execute(loginUserDto)
      res.status(200).json({
        message : "Login succesfull",
        token
      })
       
    }
}

