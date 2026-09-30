import { ISuperAdminRepository } from "../../../domain/repositories/superadmin/ISuperAdminRepository.js";
import { IGetAdminsUseCase } from "../../interfaces/superadmin/IGetAdminsUseCase.js";
import { AdminUser } from "../../types/admin/AdminUser.js";

export class GetAdminUseCase  implements IGetAdminsUseCase{
    constructor(private superAdminRepository : ISuperAdminRepository){}

    async execute(search : string | undefined,
        page : number,
        limit:number
    ): Promise<{
        admins : AdminUser[]
        pagination : {
            currentPage:number,
            totalPage:number,
            totalRecords: number,
            pageSize:number
        }
    }> {
        const result = await this.superAdminRepository.findAdmins(search,
            page,
            limit
        )
       const totalPage = Math.ceil(result.totalRecords / limit)
       return {
         admins : result.admins,
         pagination : {
            currentPage:page,
            totalPage,
            totalRecords:result.totalRecords,
            pageSize:limit
         }
       }
    }
}