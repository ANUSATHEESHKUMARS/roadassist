import { IUserRepository } from "../../domain/User/repositories/IUserRepository.js";
import { UserModel } from "../databases/models/UserModel.js";
import { User } from "../../domain/User/entities/User.js";

export class MongoUserRepository implements IUserRepository{

    async save(user:User): Promise<User>{
    const savedUser = await UserModel.create({
      fullName:user.fullName,
      email:user.email,
      phoneNumber:user.phoneNumber,
      password:user.getpassword(),
      role:user.role
    })
    user.userId = savedUser._id.toString()
    return user
    }

    
    async findbyemail(email: string): Promise<User |null>{
     const userDocument = await UserModel.findOne({email})
     if(!userDocument){
        return null
     }
     return new User(userDocument.fullName,
        userDocument.email,
        userDocument.phoneNumber,
        userDocument.password,
        userDocument.role
     )
    }
    
}