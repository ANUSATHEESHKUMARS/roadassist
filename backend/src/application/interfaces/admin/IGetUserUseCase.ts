import { GetUsersResponseDto } from "../../dtos/admin.js";

export interface IGetUserUseCase{
    execute(search? :string):Promise<GetUsersResponseDto[]>
}