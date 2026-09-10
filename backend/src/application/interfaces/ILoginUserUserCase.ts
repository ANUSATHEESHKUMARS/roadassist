import { LoginUserDTO } from "../dtos/user.js";

export interface ILoginUserUserCase {
    execute(loginUserDto:LoginUserDTO):Promise<{accessToken:string, refreshToken:string}>;
}

