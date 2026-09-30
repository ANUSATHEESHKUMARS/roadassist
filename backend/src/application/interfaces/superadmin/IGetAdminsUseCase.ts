import { AdminUser } from "../../types/admin/AdminUser.js";

export interface IGetAdminsUseCase{
 execute(search : string | undefined,
    page:number,
    limit : number
 ):Promise<{
   admins:  AdminUser[],
   pagination : {
    currentPage:number,
    totalPage:number;
    totalRecords:number
    pageSize:number
   }
 }>
}