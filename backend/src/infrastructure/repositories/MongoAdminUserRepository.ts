import { AdminUser } from "../../application/types/admin/AdminUser.js";
import { IAdminUserRepository } from "../../domain/repositories/admin/IAdminUserRepository.js";
import { UserModel } from "../databases/models/UserModel.js";

export class MongoAdminUserRepository implements IAdminUserRepository {

    async findAllUser(search?: string): Promise<AdminUser[]> {

        const filter: Record<string, unknown> = {}

        if (search && search.trim()) {
            filter.fullName = {
                $regex: search.trim(),
                $options: "i"
            }
        }

        const users = await UserModel.find()
            .select('-password')
            .lean()

        return users.map((user) => ({
            userId: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            authProvider: user.authProvider,
            status: user.status
        }))
    }
}


