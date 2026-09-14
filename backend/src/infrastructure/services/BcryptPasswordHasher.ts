import bcrypt from 'bcrypt'
import { IPasswordHasher } from "../../application/contracts/IPasswordHasher.js";


export class BcryptPasswordHasher implements IPasswordHasher {
    
    async hash(password : string) :Promise<string>{
                console.log("HASHER: hash() entered");

        const hashedPassword = await bcrypt.hash(password,10)
                console.log("HASHER: password hashed");

        return hashedPassword
    }
    async compare(password: string, hashedPassword: string): Promise<boolean> {
                console.log("HASHER: compare() entered");

        return await bcrypt.compare(password, hashedPassword)
    }
}