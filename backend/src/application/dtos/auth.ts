import { UserRole } from "../../domain/User/entities/User.js";

export interface GetCurrentUserResponseDto {
    userId : string,
    fullName:string,
    email : string,
    roles : UserRole[];
    activeRole:UserRole
}

