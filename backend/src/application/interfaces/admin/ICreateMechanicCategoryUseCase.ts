import { MechanicCategory } from "../../../domain/User/entities/MechanicCategory.js";
import { CreateMechanicCategoryDto } from "../../dtos/mechanic-category/CreateMechanicCategoryDto.js";

export interface ICreateMechanicCategoryUseCase {
    execute(dto: CreateMechanicCategoryDto): Promise<MechanicCategory>;
}