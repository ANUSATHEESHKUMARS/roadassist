import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
import { GetCurrentUserResponseDto } from "../../dtos/auth.js";
import { IGetCurrentUserUseCase } from "../../interfaces/IGetCurrentUserUseCase.js";

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {
constructor(private userRepository : IUserRepository){}
  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
        throw new NotfoundError("User not found");
    }

    return {
        userId: user.userId!,
        fullName: user.fullName,
        email: user.email,
        role: user.role
    };
}
}
