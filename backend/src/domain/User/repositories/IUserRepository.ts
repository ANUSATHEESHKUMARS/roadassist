import {User} from '../entities/User.js'

export interface IUserRepository{
    save(user: User): Promise<void>
    findbyemail(email: string): Promise<User | null>
}