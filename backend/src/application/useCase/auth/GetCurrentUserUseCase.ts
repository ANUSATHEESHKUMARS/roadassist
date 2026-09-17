import { IGetCurrentUserUseCase } from "../../interfaces/IGetCurrentUserUseCase.js";

export class GetCurrentUserUseCase implements IGetCurrentUserUseCase {

    async execute(user: {
        userId: string;
        email: string;
        role: "user" | "mechanic" | "admin";
    }) {
        return {
            userId: user.userId,
            email: user.email,
            role: user.role
        };
    }
}