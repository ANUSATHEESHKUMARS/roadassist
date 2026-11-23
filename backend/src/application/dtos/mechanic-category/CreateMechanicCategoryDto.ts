export interface CreateMechanicCategoryDto{
   name:string,
   slug:string,
   description?:string,

   subcategories:{
    name:string,
    slug:string,
    description?:string
   }[]
}