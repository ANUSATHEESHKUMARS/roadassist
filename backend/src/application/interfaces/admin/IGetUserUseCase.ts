import { GetUsersResponseDto } from "../../dtos/admin.js";

export interface IGetUserUseCase{
    execute():Promise<GetUsersResponseDto[]>
}