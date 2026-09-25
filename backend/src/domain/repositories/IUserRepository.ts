import { User } from "../User/entities/User.js"
export interface IUserRepository{
    save(user: User): Promise<User>
    findbyemail(email: string): Promise<User | null>
    findAll():Promise<User[]>
    createGoogleUser(data: {
        fullName : string,
        email : string,
        googleId:string,
    }):Promise<User>
    findById(userId : string): Promise<User | null>
}