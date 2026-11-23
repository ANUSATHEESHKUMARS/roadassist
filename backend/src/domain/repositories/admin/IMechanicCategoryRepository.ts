import { MechanicCategory } from "../../User/entities/MechanicCategory.js";

export interface IMechanicCategoryRepository {

    create(category: MechanicCategory): Promise<MechanicCategory>;

    findById(id: string): Promise<MechanicCategory | null>;

    findBySlug(slug: string): Promise<MechanicCategory | null>;

    findAll(includeInactive?: boolean): Promise<MechanicCategory[]>;

    update(category: MechanicCategory): Promise<MechanicCategory | null>;

    updateStatus(
        id: string,
        isActive: boolean
    ): Promise<MechanicCategory | null>;
}