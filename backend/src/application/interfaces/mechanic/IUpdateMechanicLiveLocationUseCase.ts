import type { 
    MechanicLiveLocationDto,
    StoredMechanicLocation
} from '../../dtos/mechanic/MechanicLiveLocationDto.js'

export interface IUpdateMechanicLiveLocationUseCase {
    execute(
        mechanicId: string,
        dto: MechanicLiveLocationDto
    ): Promise<StoredMechanicLocation>;
}