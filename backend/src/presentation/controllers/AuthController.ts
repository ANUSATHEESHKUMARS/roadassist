import { IRegisterUserUseCase } from "../../application/interfaces/IRegisterUserUseCase.js";
import { Request , Response } from "express";
import { LoginUserDTO, RegisterUserDto } from "../../application/dtos/user.js";
import { IAuthController } from "../interfaces/IAuthController.js";
import { ILoginUserUserCase } from "../../application/interfaces/ILoginUserUserCase.js";
import { HttpStatusCode } from "../../application/enum/httpCodes.js";
import { IGoogleLoginUseCase } from "../../application/interfaces/IGoogleLoginUseCase.js";
import { CommonResponse } from "../../shared/types/CommonResponse.js";
import { ResendOtpDto } from "../../application/dtos/resentOtp.js";
import { IResendOtpUseCase } from "../../application/interfaces/IResendOtpUseCase.js";
import { ICookieService } from "../../application/contracts/ICookieService.js";


export class AuthController implements IAuthController {
  constructor(private registerUserUseCase : IRegisterUserUseCase,
    private loginUserUseCase : ILoginUserUserCase,
    private googleLoginUseCase : IGoogleLoginUseCase,
    private resendOtpUseCase : IResendOtpUseCase,
    private cookieService : ICookieService
  ){}
    
    register = async (req: Request, res:Response) : Promise<void> => { 
 console.log("1. CONTROLLER START")

    console.log("REQUEST BODY:", req.body)

       const registerUserDto : RegisterUserDto = req.body;


    
      await this.registerUserUseCase.execute(registerUserDto);

      const response : CommonResponse = {
        success : true,
        message : "registration succes"
      }
      res.status(HttpStatusCode.CREATED).json(response)
    }

    login = async (req: Request, res: Response): Promise<void> =>{
          console.log("CONTROLLER FILES:", req.files);

      const loginUserDto : LoginUserDTO = req.body
  
      const result = await this.loginUserUseCase.execute(loginUserDto)

     this.cookieService.setCookie(
        res,
        "accessToken",
        result.accessToken,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000
        }
    );

    this.cookieService.setCookie(
        res,
        "refreshToken",
        result.refreshToken,
        {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }
    );
      
      const response : CommonResponse = {
        success:true,
        message:"login success"
      }
      res.status(HttpStatusCode.OK).json(response)
    }

     googleLogin = async (req: Request, res: Response): Promise<void> => {

    const { idToken } = req.body;

    const result = await this.googleLoginUseCase.execute(idToken);

    res.cookie("accessToken", result.accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

  const response : CommonResponse = {
    success : true,
    message:"login succes"
  }
  res.status(HttpStatusCode.OK).json(response)
}
resentOtp = async (req: Request, res: Response): Promise<void> =>{
   const data : ResendOtpDto = req.body
   const response = await this.resendOtpUseCase.execute(data)
   res.status(HttpStatusCode.OK).json(response)
 }
}

