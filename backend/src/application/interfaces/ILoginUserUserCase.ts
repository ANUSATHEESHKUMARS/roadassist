import { LoginUserDTO } from "../dtos/user.js";

export interface ILoginUserUserCase {
    execute(loginUserDto:LoginUserDTO):Promise<{accesToken:string, refreshToken:string}>;
}

