import { IAdminUserRepository } from "../../../domain/repositories/admin/IAdminUserRepository.js";
import { GetUsersResponseDto } from "../../dtos/admin.js";
import { IGetUserUseCase } from "../../interfaces/admin/IGetUserUseCase.js";

export class GetUserUseCase implements IGetUserUseCase {
  constructor(
    private adminUserRepository: IAdminUserRepository
  ) { }
  async execute(search: string | undefined, page: number, limit: number): Promise<{ users: GetUsersResponseDto[]; pagination: {currentPage: number, totalPage: number, totalRecords: number, pageSize: number}; }> {
    const result = await this.adminUserRepository.findAllUser(search,
      page,
      limit
    )
    const totalPage = Math.ceil(
      result.totalRecords / limit
    )

    const users: GetUsersResponseDto[] = result.users.map((user) => ({
      userId: user.userId,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      authProvider: user.authProvider,
      status: user.status
    }))

    return {
      users,
      pagination : {
        currentPage: page,
        totalPage,
        totalRecords:result.totalRecords,
        pageSize : limit
      }
    }
  }
}




