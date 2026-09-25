export interface GetCurrentUserResponseDto {
    userId : string,
    email : string,
    role : "user"|"admin"|"mechanic"
}

