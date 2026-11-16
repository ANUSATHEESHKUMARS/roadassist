
import { IMechanicScheduleRepository } from "../../../domain/repositories/IMechanicScheduleRepository.js";
import { IGetMechanicScheduleUseCase } from "../../interfaces/mechanic/IGetMechanicScheduleUseCase.js";
import { NotfoundError } from "../../../shared/errors/NotFoundError.js";
export class GetMechanicScheduleUseCase
    implements IGetMechanicScheduleUseCase {

    constructor(
        private readonly mechanicScheduleRepository: IMechanicScheduleRepository
    ) {}

    async execute(mechanicId: string) {

        const schedule =
            await this.mechanicScheduleRepository.findByMechanicId(mechanicId);

        if (!schedule) {
            throw new NotfoundError("Mechanic schedule not found");
        }

        return schedule;
    }
}
