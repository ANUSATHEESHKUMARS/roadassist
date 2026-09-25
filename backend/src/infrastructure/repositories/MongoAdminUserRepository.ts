import { AdminUser } from "../../application/types/admin/AdminUser.js";
import { IAdminUserRepository } from "../../domain/repositories/admin/IAdminUserRepository.js";
import { UserModel } from "../databases/models/UserModel.js";

export class MongoAdminUserRepository implements IAdminUserRepository {

    async findAllUser(search: string | undefined,
        page: number,
        limit: number
    ): Promise<{
        users: AdminUser[];
        totalRecords: number
    }> {

        const filter: Record<string, unknown> = {}

        if (search && search.trim()) {
            filter.fullName = {
                $regex: search.trim(),
                $options: "i"
            }
        }
        const skip = (page - 1) * limit

        const [users , totalRecords ] = await Promise.all([
            UserModel
            .find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .lean(),

            UserModel.countDocuments(filter)
        ]);

        const mappedUser: AdminUser[] = users.map((user) =>({
            userId:user._id.toString(),
            fullName :user.fullName,
            email : user.email,
            phoneNumber: user.phoneNumber,
            role:user.role,
            authProvider:user.authProvider,
            status:user.status


        }))

      return  {
        users:mappedUser,
        totalRecords
      }
    }
}


