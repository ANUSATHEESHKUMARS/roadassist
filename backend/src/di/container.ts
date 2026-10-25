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
import { GetCurrentUserUseCase } from "../application/useCase/auth/GetCurrentUserUseCase.js";
import { Logger } from "../infrastructure/logger/logger.js";
import { MongoAdminUserRepository } from "../infrastructure/repositories/MongoAdminUserRepository.js";
import { GetAdminUseCase } from "../application/useCase/superadmin/GetAdminUseCase.js";
import { SuperAdminController } from "../presentation/controllers/superadmin/SuperAdminController.js";
import { MongoSuperAdminRepository } from "../infrastructure/repositories/MongoSuperAdminRepository.js";
import { S3StorageService } from "../infrastructure/services/s3/s3StorageService.js";
import { RefreshTokenUseCase } from "../application/useCase/RefreshTokenUseCase.js";
import { MediaRepository } from "../infrastructure/repositories/MediaRepository.js";
import { UploadMediaUseCase } from "../application/useCase/media/UploadMediaUseCase.js";
import { UploadMediaController } from "../presentation/controllers/UploadMediaController.js";
import { GetMediaUseCase } from "../application/useCase/admin/GetMediaUseCase.js";
import { DeleteMediaUseCase } from "../application/useCase/admin/DeleteMediaUseCase.js";
import { MongoMechanicApplicaitonRepository } from "../infrastructure/repositories/MongoMechanicApplicationRepository.js";
import { MechanicApplicationValidator } from "../application/validators/MechanicApplicationValidaor.js";
import { SaveMechanicDraftUseCase } from "../application/useCase/mechanic/SaveMechanicApplicaitonDraftuseCase.js";
import { MechanicApplicationController } from "../presentation/controllers/mechanic/SaveMechanicDraftController.js";
import { SubmitMechanicApplicationUseCase } from "../application/useCase/mechanic/SubmitMechanicApplicationUseCase.js";
import { GetMechanicApplicationUseCase } from "../application/useCase/mechanic/GetMechanicApplicationUseCase.js";
import { BlockUserUseCase } from "../application/useCase/admin/BlockUserUseCase.js";
import { UnblockUserUseCase } from "../application/useCase/admin/UnblockUserUseCase.js";
import { EmergencyRequestRepository } from "../infrastructure/repositories/EmergencyRequestRepository.js";
import { CreateEmergencyRequestUseCase } from "../application/useCase/emergency/CreateEmergencyRequestUseCase.js";
import { CreateEmerencyRequestValidator } from "../application/validators/CreateEmergencyRequestValidator.js";
import { CreateEmergencyRequestController } from "../presentation/controllers/EmergencyRequestController.js";
import { UploadEmergencyImagesUseCase } from "../application/useCase/emergency/UploadEmergencyImagesUseCase.js";
import { UploadEmergencyImagesController } from "../presentation/controllers/UploademergencyImagesController.js";
import { RedisPasswordResetTokenRepository } from "../infrastructure/repositories/RedisPasswordResetTokenRepository.js";
import { PasswordResetTokenService } from "../infrastructure/services/PasswordResetTokenService.js";
import { ResetPasswordUseCase } from "../application/useCase/auth/ResetPasswordUseCase.js";
import { VerifyPasswordResetOtpUseCase } from "../application/useCase/auth/VerifyPasswordResetOtpUseCase.js";
import { RequestPasswordResetUseCase } from "../application/useCase/auth/RequestPasswordResetUseCaset.js";
import { RequestPasswordResetController } from "../presentation/controllers/RequestPasswordResetController.js";
import { VerifyPasswordResetOtpController } from "../presentation/controllers/VerifyPasswordResetController.js";
import { ResetPasswordController } from "../presentation/controllers/ResetPasswordController.js";


const userRepository = new MongoUserRepository();

const passwordHasher = new BcryptPasswordHasher();

const tokenService = new JwtTokenService()

export const auth = authMiddleware(tokenService, userRepository)

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
    , pendingRegistrationRepository,
    userRepository,
    tokenService
)

const cookieService = new CookieService()

export const verifyotpcontroller = new VerifyOtpController(verifyotpUseCase,
    cookieService
)


const vehiceRepository = new VehicleRepostory()

const vehicleValidator = new VehicleValidator()

const s3StorageService = new S3StorageService()

const createVehicleUseCase = new CreateVehicleUseCase(vehiceRepository, vehicleValidator, s3StorageService)

const getVehicleUseCase = new GetVehilceUseCase(vehiceRepository, s3StorageService)

const getVehiclebyIdUseCase = new GetVehicleByIdUseCase(vehiceRepository, s3StorageService)

const updateVehicleUseCase = new UpdateVehicleUseCase(vehiceRepository, s3StorageService)

const removeVehicleUseCase = new DeleteVehicleUseCase(vehiceRepository)

const logger = new Logger()


const superAdminRepository = new MongoSuperAdminRepository()

const getAdminUseCase = new GetAdminUseCase(superAdminRepository)


export const superAdminController = new SuperAdminController(getAdminUseCase)

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


const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepository)

const blockUserUseCase = new BlockUserUseCase(userRepository)

const unblockUserCase = new UnblockUserUseCase(userRepository)

const mediaRepository = new MediaRepository()


const uploadMediaUseCase = new UploadMediaUseCase(
    mediaRepository,
    s3StorageService
)

const getMediaUseCase = new GetMediaUseCase(mediaRepository, s3StorageService)

const deleteMediaUseCase = new DeleteMediaUseCase(mediaRepository, s3StorageService)




//mechanic 





const mechanicApplicationRepository = new MongoMechanicApplicaitonRepository()

const getMechanicApplicatinUseCase = new GetMechanicApplicationUseCase(mechanicApplicationRepository)


export const adminController = new AdminController(getUserUseCase,
    getMechanicApplicatinUseCase,
    blockUserUseCase,
    unblockUserCase)

const mechanicApplicationValidator = new MechanicApplicationValidator()

const saveMechanicDraftUseCase = new SaveMechanicDraftUseCase(
    mechanicApplicationRepository,
    mechanicApplicationValidator
)

//emergency

const emergencyRequestRepository = new EmergencyRequestRepository()
const createEmergencyRequestValidator = new CreateEmerencyRequestValidator()

const createEmergencyRequestUseCase = new CreateEmergencyRequestUseCase(emergencyRequestRepository,
    vehiceRepository,
    createEmergencyRequestValidator

)
const emergencyImageUploadUseCase = new UploadEmergencyImagesUseCase(s3StorageService)

export const emergencyImageUploadController = new UploadEmergencyImagesController(emergencyImageUploadUseCase)




export const createEmergencyRequestController = new CreateEmergencyRequestController(createEmergencyRequestUseCase)

const submitMechanicApplicationUseCase = new SubmitMechanicApplicationUseCase(mechanicApplicationRepository, mechanicApplicationValidator)

export const mechanicApplicationController = new MechanicApplicationController(saveMechanicDraftUseCase, submitMechanicApplicationUseCase)



export const uploadMediaController = new UploadMediaController(uploadMediaUseCase, getMediaUseCase, deleteMediaUseCase, s3StorageService)



const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, tokenService)

export const authcontroller = new AuthController(registerUserUseCase,
    loginUserUseCase,
    googleLoginUseCase,
    resendOtpUseCase,
    cookieService,
    getCurrentUserUseCase,
    refreshTokenUseCase,
    logger

)


const passwordResetTokenRepository =
    new RedisPasswordResetTokenRepository();

const passwordResetTokenService =
    new PasswordResetTokenService();

const requestPasswordResetUseCase =
    new RequestPasswordResetUseCase(
        userRepository,
        otpRepository,
        otpService,
        emailService
    );

const verifyPasswordResetOtpUseCase =
    new VerifyPasswordResetOtpUseCase(
        otpRepository,
        otpService,
        passwordResetTokenService,
        passwordResetTokenRepository
    );

const resetPasswordUseCase =
    new ResetPasswordUseCase(
        userRepository,
        passwordResetTokenRepository,
        passwordResetTokenService,
        passwordHasher
    );


    export const requestPasswordResetController = new RequestPasswordResetController(requestPasswordResetUseCase)

    export const verifyPasswordResetOtpController = new VerifyPasswordResetOtpController(verifyPasswordResetOtpUseCase)

    export const resetPasswordController = new ResetPasswordController(resetPasswordUseCase)
