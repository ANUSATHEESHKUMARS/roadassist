import { LoginUserUseCase } from "../application/auth/LoginUserUseCase.js";
import { RegisterUserUseCase } from "../application/auth/RegisterUserUseCase.js";
import { SendOtpUseCase } from "../application/auth/SendOtpUseCase.js";
import { VerifyOtpUseCase } from "../application/auth/VerifyOtpUseCase.js";
import { RegisterUserValidator } from "../application/validators/RegisterUserValidator.js";
import { MongoOtpRepository } from "../infrastructure/repositories/MongoOtpRepository.js";
import { MongoUserRepository } from "../infrastructure/repositories/MongoUserRepository.js";
import { BcryptPasswordHasher } from "../infrastructure/services/BcryptPasswordHasher.js";
import { JwtTokenService } from "../infrastructure/services/jwtTokenService.js";
import { OtpService } from "../infrastructure/services/OtpService.js";
import { AuthController } from "../presentation/controllers/AuthController.js";
import { VerifyOtpController } from "../presentation/controllers/VerifyOtpController.js";


const userRepository = new MongoUserRepository();

const passwordHasher = new BcryptPasswordHasher();

const tokenService = new JwtTokenService()

const registerUserValidator = new RegisterUserValidator()



const otpRepository = new MongoOtpRepository()

const otpService = new OtpService()

const sendOtpUseCase  = new SendOtpUseCase( otpRepository ,otpService)

const registerUserUseCase = new RegisterUserUseCase(passwordHasher , userRepository, registerUserValidator, sendOtpUseCase)

const loginUserUseCase = new LoginUserUseCase(userRepository , passwordHasher ,tokenService )

const verifyotpUseCase = new VerifyOtpUseCase(otpRepository , otpService)

export const verifyotpcontroller = new VerifyOtpController(verifyotpUseCase)

export const authcontroller  = new AuthController(registerUserUseCase , loginUserUseCase)




