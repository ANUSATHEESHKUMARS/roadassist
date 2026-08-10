import { RegisterUserUseCase } from "../application/auth/RegisterUserUseCase.js";
import { RegisterUserValidator } from "../application/validators/RegisterUserValidator.js";
import { MongoUserRepository } from "../infrastructure/repositories/MongoUserRepository.js";
import { BcryptPasswordHasher } from "../infrastructure/services/BcryptPasswordHasher.js";
import { AuthController } from "../presentation/controllers/AuthController.js";
import { IAuthController } from "../presentation/interfaces/IAuthController.js";



const userRepository = new MongoUserRepository();

const passwordHasher = new BcryptPasswordHasher();

const registerUserValidator = new RegisterUserValidator()

const registerUserUseCase = new RegisterUserUseCase(passwordHasher , userRepository, registerUserValidator)



export const authcontroller  = new AuthController(registerUserUseCase)