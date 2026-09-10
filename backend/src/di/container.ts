import { LoginUserUseCase } from "../application/useCase/auth/LoginUserUseCase.js";
import { RegisterUserUseCase } from "../application/useCase/auth/RegisterUserUseCase.js";
import { SendOtpUseCase } from "../application/useCase/auth/SendOtpUseCase.js";
import { VerifyOtpUseCase } from "../application/useCase/auth/VerifyOtpUseCase.js";
import { RegisterUserValidator } from "../application/validators/RegisterUserValidator.js";
import { MongoOtpRepository } from "../infrastructure/repositories/MongoOtpRepository.js";
import { MongoUserRepository } from "../infrastructure/repositories/MongoUserRepository.js";
import { BcryptPasswordHasher } from "../infrastructure/services/BcryptPasswordHasher.js";
import { OtpService } from "../infrastructure/services/OtpService.js";
import { AuthController } from "../presentation/controllers/AuthController.js";
import { VerifyOtpController } from "../presentation/controllers/VerifyOtpController.js";
import { JwtTokenService } from "../infrastructure/services/JwtTokenService.js";
import { VehicleRepostory } from "../infrastructure/repositories/MongoVehicleRepostory.js";
import { CreateVehicleUseCase } from "../application/useCase/vehicle/CreateVehicleUseCase.js";
import { CreateVehicleController } from "../presentation/controllers/vehicleController/CreateVehicleController.js";
import { authMiddleware } from "../presentation/middlewares/authMiddleware.js";
import { GetVehilceUseCase } from "../application/useCase/vehicle/GetVehicle.js";
import { GetVehicleByIdUseCase } from "../application/useCase/vehicle/GetVehicleByIdUseCase.js";
import { UpdateVehicleUseCase } from "../application/useCase/vehicle/UpdatevehicleUseCase.js";
import { DeleteVehicleUseCase } from "../application/useCase/vehicle/DeleteVehicleUseCase.js";


const userRepository = new MongoUserRepository();

const passwordHasher = new BcryptPasswordHasher();

const tokenService = new JwtTokenService()

export const auth = authMiddleware(tokenService)

const registerUserValidator = new RegisterUserValidator()



const otpRepository = new MongoOtpRepository()

const otpService = new OtpService()

const sendOtpUseCase = new SendOtpUseCase(otpRepository, otpService)

const registerUserUseCase = new RegisterUserUseCase(passwordHasher, userRepository, registerUserValidator, sendOtpUseCase)

const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService)

const verifyotpUseCase = new VerifyOtpUseCase(otpRepository, otpService)

export const verifyotpcontroller = new VerifyOtpController(verifyotpUseCase)

export const authcontroller = new AuthController(registerUserUseCase, loginUserUseCase)



const vehiceRepository = new VehicleRepostory()

const createVehicleUseCase = new CreateVehicleUseCase(vehiceRepository)

const getVehicleUseCase = new GetVehilceUseCase(vehiceRepository)

const getVehiclebyIdUseCase = new GetVehicleByIdUseCase(vehiceRepository)

const updateVehicleUseCase = new UpdateVehicleUseCase(vehiceRepository)

const removeVehicleUseCase = new DeleteVehicleUseCase(vehiceRepository)

export const createVehicleController = new CreateVehicleController(createVehicleUseCase,
    getVehicleUseCase,
    getVehiclebyIdUseCase,
    updateVehicleUseCase,
    removeVehicleUseCase
)



