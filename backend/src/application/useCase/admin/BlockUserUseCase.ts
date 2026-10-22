import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User } from "../../../domain/User/entities/User.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { IBlockUserUseCase } from "../../interfaces/admin/IBlockUserUseCase.js";

export class BlockUserUseCase implements IBlockUserUseCase{
    constructor(private userRepository: IUserRepository){}
   async  execute(userId: string): Promise<User> {
        if(!userId){
            throw new ConflictError("User Id is required","USER_ID_NOT_FOUND")
        }
        const user = await this.userRepository.findById(userId)

        if(!user){
            throw new UnauthorizedError("user not found","USER_NOT_FOUND")
        }
        if(user.status === "blocked"){
            throw new ConflictError("User is alredy blocked")
        }
        if(user.role === "superadmin"){
            throw new ConflictError("Superadmin cannot be blocked through this operation")
        }
        const updatedUser = await this.userRepository.updateStatus(userId , "blocked")

        if(!updatedUser){
            throw new ConflictError("Failed to block user","CANT_BLOCK_USER")
        }
        return updatedUser
    }
}