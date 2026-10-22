import { IMechanicApplicationRepository } from "../../../domain/repositories/mechanic/IMechanicApplicationRepository.js";
import { MechanicApplication, MechanicApplicationStatus } from "../../../domain/User/entities/MechanicApplication.js";
import { IGetMechanicApplicationUseCase } from "../../interfaces/mechanic/IGetMechanicApplicationUseCase.js";

export class GetMechanicApplicationUseCase implements IGetMechanicApplicationUseCase{
    constructor(private mechanicApplicationRepository: IMechanicApplicationRepository){}
    execute(status: MechanicApplicationStatus): Promise<MechanicApplication[]> {
        const application = this.mechanicApplicationRepository.findByStatus(status)
        return application
    }
}

