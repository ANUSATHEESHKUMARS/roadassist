import { User, UserRole } from "../../../domain/User/entities/User.js";
import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { ISwitchActiveRoleUseCase } from "../../interfaces/ISwitchActiveRoleUseCase.js";
import { BadRequest } from "../../../shared/errors/BadRequestError.js";
import { ConflictError } from "../../../shared/errors/ConflitError.js";

export class SwitchActiveRoleUseCase implements ISwitchActiveRoleUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string, role: UserRole): Promise<User> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new BadRequest("User not found", "USER_NOT_FOUND");
        }

        if (!user.roles.includes(role)) {
            throw new ConflictError(
                "User does not have the requested role",
                "ROLE_NOT_ASSIGNED"
            );
        }

        const updatedUser = await this.userRepository.updateActiveRole(userId, role);

        if (!updatedUser) {
            throw new BadRequest("Failed to switch active role", "ROLE_SWITCH_FAILED");
        }

        return updatedUser;
    }
}
