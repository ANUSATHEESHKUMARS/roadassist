
export interface IResetPasswordUseCase {
    execute(
        resetToken: string,
        newPassword: string
    ): Promise<{ message: string }>;
}
