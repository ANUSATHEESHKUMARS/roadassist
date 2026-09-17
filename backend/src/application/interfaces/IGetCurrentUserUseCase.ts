export interface IGetCurrentUserUseCase {
    execute(user: {
        userId: string;
        email: string;
        role: "user" | "mechanic" | "admin";
    }): Promise<{
        userId: string;
        email: string;
        role: "user" | "mechanic" | "admin";
    }>;
}