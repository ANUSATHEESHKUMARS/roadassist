import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";

export interface IGetMyMechanicApplicationUseCase {
    execute(userId: string): Promise<MechanicApplication | null>;
}
