import { IUserRepository } from "../../domain/repositories/IUserRepository.js";
import { UserModel } from "../databases/models/UserModel.js";
import { User , UserRole , AuthProvider} from "../../domain/User/entities/User.js";



export class MongoUserRepository implements IUserRepository {

   async save(user: User): Promise<User> {

    const userData: {
        fullName: string;
        email: string;
        phoneNumber: string;
        role: UserRole;
        authProvider: AuthProvider;
        password?: string;
        googleId?: string;
    } = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        authProvider: user.authProvider
    };

    const password = user.getpassword();

    if (password !== undefined) {
        userData.password = password;
    }

    if (user.googleId !== undefined) {
        userData.googleId = user.googleId;
    }

    const savedUser = await UserModel.create(userData);

    user.userId = savedUser._id.toString();

    return user;
}

   async findbyemail(email: string): Promise<User | null> {
      const userDocument = await UserModel.findOne({ email })
      if (!userDocument) {
         return null
      }
      return new User(userDocument.fullName,
         userDocument.email,
         userDocument.phoneNumber,
         userDocument.password,
         userDocument.role,
         userDocument._id.toString(),
         userDocument.googleId,
         userDocument.authProvider
      )
   }
   async findAll(): Promise<User[]> {
      const users = await UserModel.find().select("-password")
      return users.map((user) => {
         return new User(
            user.fullName,
            user.email,
            user.phoneNumber,
            undefined,
            user.role,
            user._id.toString(),
          user.googleId,
          user.authProvider
         )
      })
   }
   async createGoogleUser(data: { fullName: string; email: string; googleId: string; }): Promise<User> {
      const userDocument = await UserModel.create({
         fullName:data.fullName,
         email:data.email,
         role:"user",
         googleId:data.googleId,
         authProvider:"GOOGLE"
      })
       return new User(
        userDocument.fullName,
        userDocument.email,
        userDocument.phoneNumber,
        userDocument.password,
        userDocument.role,
        userDocument._id.toString(),
        userDocument.googleId,
        userDocument.authProvider
    );
   }

}


