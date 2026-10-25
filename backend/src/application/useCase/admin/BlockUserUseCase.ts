import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User, AccountStatus} from "../../../domain/User/entities/User.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { IBlockUserUseCase } from "../../interfaces/admin/IBlockUserUseCase.js";

export class BlockUserUseCase implements IBlockUserUseCase{
    constructor(private readonly userRepository :IUserRepository){}

    async execute(userId: string): Promise<User> {
        if(!userId || !userId.trim()){
            throw new ConflictError("User Id is required",
                "USER_ID_REQUIRED"
            )
        }
        const user = await this.userRepository.findById(userId)

        if(!user){
            throw new NotfoundError('User not found',"USER_NOT_FOUND")
        }
        if(user.status === "blocked" ){
            throw new ConflictError('User is alredy blocked',"USER_ALREDY_BLOCKED")
        }
        if(user.role === "superadmin"){
            throw new ConflictError("SuperAdmin cannot be blocked through this operation","SUPERADMIN_BLOCK_NOT_ALLOWED")
        }
        const updatedUser = await this.userRepository.updateStatus(userId, "blocked")

        if(!updatedUser){
            throw new ConflictError("Failed to block user","CANT_BLOCK_USER")
        }
        return updatedUser
    }
}