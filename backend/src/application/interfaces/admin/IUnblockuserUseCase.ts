import { User } from "../../../domain/User/entities/User.js";

export interface IUnblockUserUseCase {
    execute(userId : string):Promise<User>
}