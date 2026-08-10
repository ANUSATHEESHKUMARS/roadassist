import { IRegisterUserUseCase } from "../../application/interfaces/IRegisterUserUseCase.js";
import { Request , Response } from "express";
import { RegisterUserDto } from "../../application/dtos/RegisterUserDTO.js";

export class AuthController {
  constructor(private registerUserUseCase : IRegisterUserUseCase){}
    
    register = async (req: Request, res:Response) : Promise<void> => { 
      console.log('this is controller' ,req.body)
        
       const registerUserDto : RegisterUserDto = req.body;
       console.log('register dbt' , registerUserDto)
       await this.registerUserUseCase.execute(registerUserDto);
       
       res.status(200).json({
        message : "Register succesfull"
       })
    }

}

