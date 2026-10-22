import { User } from "../../../domain/User/entities/User.js";

export interface IBlockUserUseCase{
    execute(userId:string):Promise<User>
}