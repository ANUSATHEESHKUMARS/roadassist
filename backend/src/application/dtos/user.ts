export type RegisterationRole = "user"|"admin"

export interface RegisterUserDto {
    fullName: string,
    email: string,
    phoneNumber: string,
    password : string,
    roles : RegisterationRole
} 


export interface LoginUserDTO {
    email:string,
    password : string
}


