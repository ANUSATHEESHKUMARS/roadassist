import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { GetUsersResponseDto } from "../../dtos/admin.js";
import { IGetUserUseCase } from "../../interfaces/admin/IGetUserUseCase.js";



export class GetUserUseCase implements IGetUserUseCase{
    constructor(private userRepository : IUserRepository){}
  async execute(): Promise<GetUsersResponseDto[]> {
      const users = await this.userRepository.findAll()
      return users.map((user) =>({
        userId:user.userId!,
        fullName:user.fullName,
        email:user.email,
        phoneNumber:user.phoneNumber,
       
      }))
  }
}






