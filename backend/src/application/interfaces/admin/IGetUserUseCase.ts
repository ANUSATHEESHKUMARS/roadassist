import { GetUsersResponseDto } from "../../dtos/admin.js";
import { RegisterUserDto } from "../../dtos/user.js";

export interface IGetUserUseCase{
    execute():Promise<GetUsersResponseDto[]>
}