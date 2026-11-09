import { User } from "../../domain/User/entities/User.js";
import { SwitchActiveRoleDto } from "../dtos/SwitchActiveRoleDto.js";

export interface ISwitchActiveRoleUseCase {
    execute(
        userId: string,
        dto: SwitchActiveRoleDto
    ): Promise<User>;
}