


export interface MechanicSubcategory {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
}




export interface MechanicCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    subcategories: MechanicSubcategory[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}




export interface CreateMechanicCategoryDto {
    name: string;
    slug: string;
    description?: string;

    subcategories: {
        name: string;
        slug: string;
        description?: string;
    }[];
}


/* ================================
   UPDATE CATEGORY DTO
================================ */

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


/* ================================
   UPDATE CATEGORY STATUS DTO
================================ */

export interface UpdateMechanicCategoryStatusDto {
    isActive: boolean;
}


/* ================================
   API RESPONSE
================================ */

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}
