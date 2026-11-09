import { IUserRepository } from "../../../domain/repositories/IUserRepository.js";
import { User, UserRole } from "../../../domain/User/entities/User.js";
import { SwitchActiveRoleDto } from "../../dtos/SwitchActiveRoleDto.js";
import { ISwitchActiveRoleUseCase } from "../../interfaces/ISwitchActiveRoleUseCase.js";
import { ForbiddenError } from "../../../shared/errors/ForbiddenError.js";

const allowedRoles: UserRole[] = [
    "user",
    "mechanic",
    "admin",
    "superadmin",
];

export class SwitchActiveRoleUseCase
    implements ISwitchActiveRoleUseCase {

    constructor(
        private readonly userRepository: IUserRepository
    ) {}

    async execute(
        userId: string,
        dto: SwitchActiveRoleDto
    ): Promise<User> {

        const { activeRole } = dto;

        // Validate requested role
        if (!allowedRoles.includes(activeRole)) {
            throw new ForbiddenError(
                "Invalid role requested",
                "INVALID_ROLE"
            );
        }

        // Find the authenticated user
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new ForbiddenError(
                "User account not found",
                "USER_NOT_FOUND"
            );
        }

        // Check account status
        if (user.status !== "active") {
            throw new ForbiddenError(
                "Your account is blocked",
                "ACCOUNT_BLOCKED"
            );
        }

        // Check whether the user is authorized for this role
        if (!user.roles.includes(activeRole)) {
            throw new ForbiddenError(
                `You are not authorized to switch to ${activeRole}`,
                "ROLE_NOT_ASSIGNED"
            );
        }

        // Update active role in MongoDB
        const updatedUser =
            await this.userRepository.updateActiveRole(
                userId,
                activeRole
            );

        if (!updatedUser) {
            throw new ForbiddenError(
                "Unable to update active role",
                "ROLE_UPDATE_FAILED"
            );
        }

        return updatedUser;
    }
}