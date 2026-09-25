import { GetUsersResponseDto } from "../../dtos/admin.js";

export interface IGetUserUseCase{
    execute(search :string | undefined,
        page: number,
        limit : number
    ):Promise<{
        users : GetUsersResponseDto[];
        pagination : {
            currentPage:number,
            totalPage:number,
            totalRecords:number,
            pageSize:number
        
}}>
}