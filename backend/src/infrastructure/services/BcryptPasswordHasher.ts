import bcrypt from 'bcrypt'
import { IPasswordHasher } from "../../application/contracts/IPasswordHasher.js";


export class BcryptPasswordHasher implements IPasswordHasher {
    async hash(password : string) :Promise<string>{
        const hashedPassword = await bcrypt.hash(password,10)
        return hashedPassword
    }
}