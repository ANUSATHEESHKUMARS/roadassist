import { User, UserRole } from "../../domain/User/entities/User.js";

export interface ISwitchActiveRoleUseCase {
    execute(userId: string, role: UserRole): Promise<User>;
}
