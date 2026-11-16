import { MechanicApplication } from "../../../domain/User/entities/MechanicApplication.js";
import { UpdateMechanicServiceLocationDto } from "../../../application/dtos/mechanic/UpdateMechanicservicelocationDto.js";
export interface IUpdateMechanicServiceLocationUseCase {
    execute(
        userId: string,
        dto: UpdateMechanicServiceLocationDto
    ): Promise<MechanicApplication>;
}