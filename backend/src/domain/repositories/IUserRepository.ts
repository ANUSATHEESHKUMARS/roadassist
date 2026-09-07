import { User } from "../User/entities/User.js"
export interface IUserRepository{
    save(user: User): Promise<User>
    findbyemail(email: string): Promise<User | null>
}