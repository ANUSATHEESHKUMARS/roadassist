import { GetCurrentUserResponseDto } from "../dtos/auth.js";

export interface IGetCurrentUserUseCase {
    execute(userId : string): Promise<GetCurrentUserResponseDto>;
}

