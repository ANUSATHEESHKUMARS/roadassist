import { MechanicSpecializationSelectionDto }
    from "../../dtos/admin/MechanicSpecializationSelectionDto.js";

export interface IMechanicSpecializationValidator {
    validate(
        selections?: MechanicSpecializationSelectionDto[]
    ): Promise<void>;
}