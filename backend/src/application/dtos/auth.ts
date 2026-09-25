export interface GetCurrentUserResponseDto {
    userId : string,
    fullName:string,
    email : string,
    role : "user"|"admin"|"mechanic"
}

