export interface GetUsersResponseDto {
    userId: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    status : "active" | "blocked"
}