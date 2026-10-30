import { User } from "../../domain/User/entities/User.js";
import { IUserDocuments } from "../../infrastructure/databases/models/UserModel.js";

export class UserMapper {
    static toDomain(document : IUserDocuments):User{
        return new User(
            document.fullName,
            document.email,
            document.phoneNumber,
            document.password,
            document.roles,
            document._id.toString(),
            document.googleId,
            document.authProvider,
            document.status ?? "active",
            document.activeRole
        )
    }
}