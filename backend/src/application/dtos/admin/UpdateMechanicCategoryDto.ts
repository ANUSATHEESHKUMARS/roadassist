
export interface UpdateMechanicCategoryDto {
    name: string;
    slug: string;
    description?: string | null;

    subcategories: {
        id?: string;
        name: string;
        slug: string;
        description?: string;
        isActive?: boolean;
    }[];
}