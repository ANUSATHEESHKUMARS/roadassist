export interface IJoinEmergencyTrackingUseCase {
    execute(
        requestId: string,
        userId: string
    ): Promise<void>;
}