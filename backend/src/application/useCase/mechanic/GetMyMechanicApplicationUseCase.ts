import { IMechanicApplicationRepository } from "../../../domain/repositories/mechanic/IMechanicApplicationRepository.js";
import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { IGetMyMechanicApplicationUseCase } from "../../interfaces/mechanic/IGetMyMechanicApplicationUseCase.js";

export class GetMyMechanicApplicationUseCase implements IGetMyMechanicApplicationUseCase {
    constructor(
        private readonly mechanicApplicationRepository: IMechanicApplicationRepository
    ) {}

    async execute(userId: string): Promise<MechanicApplication | null> {
        return this.mechanicApplicationRepository.findByUserId(userId);
    }
}
