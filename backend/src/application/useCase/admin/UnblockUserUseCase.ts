import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User } from "../../../domain/User/entities/User.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";
import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { IUnblockUserUseCase } from "../../interfaces/admin/IUnblockuserUseCase.js";

export class UnblockUserUseCase implements IUnblockUserUseCase{
    constructor(private userRepository : IUserRepository){}

    async execute(userId: string): Promise<User> {
        if(!userId){
            throw new ConflictError("User id not found" , "USER_ID_NOT_FOUND")
        }
        const user = await this.userRepository.findById(userId)
        if(!user){
            throw new UnauthorizedError('User not found in db', "USER_NOT_FOUND")
        }
        if(user.status === 'active'){
            throw new ConflictError("User is alredy active","CANT_BLOCK_USER")
        }
        if(user.role === "superadmin"){
            throw new ConflictError("Superadmin cannot be unblocked through this operation","CANT_BLOCK_SUPERADMIN")
        }
        const updatedUser = await this.userRepository.updateStatus(userId , "active")

       if(!updatedUser){
        throw new ConflictError("cant update user status", "CANT_CHANGE_USER_STATUS")
       }
       return updatedUser
    }
}