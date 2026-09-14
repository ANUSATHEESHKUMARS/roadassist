export interface IGoogleLoginUseCase {
    execute(idToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
}