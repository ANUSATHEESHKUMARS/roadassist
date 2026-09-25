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
import { EmailService } from "../infrastructure/services/EmailService.js";
import { GetUserUseCase } from "../application/useCase/admin/GetUserUseCase.js";
import { AdminController } from "../presentation/controllers/admin/AdminController.js";
import { GoogleAuthService } from "../infrastructure/services/GoogleAuthService.js";
import { GoogleLoginUseCase } from "../application/useCase/auth/GoogleLoginUseCase.js";
import { ResentOtpUseCase } from "../application/useCase/auth/ResendOtpUseCase.js";
import { RedisPendingRegistrationRepository } from "../infrastructure/repositories/RedisPendingRegistrationRepository.js";
import { CookieService } from "../infrastructure/services/CookieService.js";
import { VehicleValidator } from "../application/validators/VehicleValidator.js";
import { CloudinaryStorageService } from "../infrastructure/services/cloudinary/CloudinaryStorageService.js";
import { GetCurrentUserUseCase } from "../application/useCase/auth/GetCurrentUserUseCase.js";
import { Logger } from "../infrastructure/logger/logger.js";
import { MongoAdminUserRepository } from "../infrastructure/repositories/MongoAdminUserRepository.js";


const userRepository = new MongoUserRepository();

const passwordHasher = new BcryptPasswordHasher();

const tokenService = new JwtTokenService()

export const auth = authMiddleware(tokenService)

const registerUserValidator = new RegisterUserValidator()



const otpRepository = new MongoOtpRepository()

const otpService = new OtpService()

const emailService = new EmailService()

const sendOtpUseCase = new SendOtpUseCase(otpRepository, otpService, emailService)


const pendingRegistrationRepository = new RedisPendingRegistrationRepository()

const resendOtpUseCase = new ResentOtpUseCase(otpRepository, otpService, emailService, pendingRegistrationRepository)

const registerUserUseCase = new RegisterUserUseCase(
    passwordHasher,
    userRepository,
    registerUserValidator,
    sendOtpUseCase,
    pendingRegistrationRepository
)

const loginUserUseCase = new LoginUserUseCase(userRepository, passwordHasher, tokenService)

const verifyotpUseCase = new VerifyOtpUseCase(otpRepository, 
    otpService
    ,pendingRegistrationRepository, 
    userRepository,
    tokenService
)

const cookieService = new CookieService()

export const verifyotpcontroller = new VerifyOtpController(verifyotpUseCase,
    cookieService
)


const vehiceRepository = new VehicleRepostory()

const vehicleValidator = new VehicleValidator()

const fileStorageService = new CloudinaryStorageService()

const createVehicleUseCase = new CreateVehicleUseCase(vehiceRepository,vehicleValidator,fileStorageService)

const getVehicleUseCase = new GetVehilceUseCase(vehiceRepository)

const getVehiclebyIdUseCase = new GetVehicleByIdUseCase(vehiceRepository)

const updateVehicleUseCase = new UpdateVehicleUseCase(vehiceRepository, fileStorageService)

const removeVehicleUseCase = new DeleteVehicleUseCase(vehiceRepository)

const logger = new Logger()



export const createVehicleController = new CreateVehicleController(createVehicleUseCase,
    getVehicleUseCase,
    getVehiclebyIdUseCase,
    updateVehicleUseCase,
    removeVehicleUseCase
)

const googleAuthService = new GoogleAuthService()

const googleLoginUseCase = new GoogleLoginUseCase(googleAuthService,
    userRepository,
    tokenService
)

const adminUserRepository = new MongoAdminUserRepository()

const getUserUseCase = new GetUserUseCase(adminUserRepository)

export const adminController = new AdminController(getUserUseCase)

const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository)

export const authcontroller = new AuthController(registerUserUseCase,
    loginUserUseCase,
    googleLoginUseCase,
    resendOtpUseCase,
    cookieService,
    getCurrentUserUseCase

)






