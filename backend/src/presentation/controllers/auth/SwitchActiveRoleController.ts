import { Request, Response } from "express";
import { CommonResponse } from "../../../shared/types/CommonResponse.js";
import { ISwitchActiveRoleUseCase } from "../../../application/interfaces/ISwitchActiveRoleUseCase.js";
import { HttpStatusCode } from "../../../application/enum/httpCodes.js";
import { UserRole } from "../../../domain/User/entities/User.js";

export class SwitchActiveRoleController {
    constructor(private readonly switchActiveRoleUseCase: ISwitchActiveRoleUseCase) {}

    execute = async (req: Request, res: Response): Promise<void> => {
        const userId = req.user?.userId;

        if (!userId) {
            const response: CommonResponse = {
                success: false,
                message: "Authentication required"
            };
            res.status(HttpStatusCode.UNAUTHORIZED).json(response);
            return;
        }

        const { role } = req.body as { role: UserRole };

        if (!role) {
            const response: CommonResponse = {
                success: false,
                message: "Role is required"
            };
            res.status(HttpStatusCode.BAD_REQUEST).json(response);
            return;
        }

        const updatedUser = await this.switchActiveRoleUseCase.execute(userId, role);

        const response: CommonResponse<{
            userId: string;
            fullName: string;
            email: string;
            roles: UserRole[];
            activeRole: UserRole;
        }> = {
            success: true,
            message: "Active role switched successfully",
            data: {
                userId: updatedUser.userId!,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                roles: updatedUser.roles,
                activeRole: updatedUser.activeRole,
            }
        };
        res.status(HttpStatusCode.OK).json(response);
    };
}
