import { UserRole } from "../../domain/User/entities/User.js";
export interface GetUsersResponseDto {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: UserRole;
}