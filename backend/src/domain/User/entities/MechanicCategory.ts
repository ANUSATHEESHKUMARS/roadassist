export interface MechanicSubcategory{
    id?:string,
    name:string,
    slug:string,
    description?:string,
    isActive:boolean
}

export interface MechanicCategoryProps{
    id?:string,
    name:string,
    slug:string,
    description?:string,
    subcategories:MechanicSubcategory[];
    isActive:boolean,
    createdAt?:Date;
    updatedAt?:Date;
}


export class MechanicCategory {
    constructor(private readonly props:MechanicCategoryProps){}
    get id():string | undefined {
        return this.props.id
    }
    get name():string {
        return this.props.name
    }
    get slug():string{
        return this.props.slug
    }
    get description(): string | undefined {
        return this.props.description
    }
    get subcategories():MechanicSubcategory[] {
        return this.props.subcategories.map((subcategory:MechanicSubcategory) =>({
            ...subcategory
        }))
    }
    get isActive():boolean {
        return this.props.isActive
    }
    get createdAt():Date | undefined {
        return this.props.createdAt
    }
    get updatedAt():Date | undefined {
        return this.props.updatedAt
    }

}