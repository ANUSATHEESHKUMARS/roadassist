import { IAdminUserRepository } from "../../../domain/repositories/admin/IAdminUserRepository.js";
import { GetUsersResponseDto } from "../../dtos/admin.js";
import { IGetUserUseCase } from "../../interfaces/admin/IGetUserUseCase.js";

export class GetUserUseCase implements IGetUserUseCase{
  constructor(
    private adminUserRepository : IAdminUserRepository
  ){}
 async execute(search? : string): Promise<GetUsersResponseDto[]> {
    const users = await this.adminUserRepository.findAllUser(search)
    return users.map((user) =>({
      userId: user.userId,
      fullName:user.fullName,
      email:user.email,
      phoneNumber:user.phoneNumber,
      role:user.role,
      authProvider:user.authProvider,
      status:user.status
    }))
  }
}



