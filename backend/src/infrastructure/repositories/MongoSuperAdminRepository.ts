import { AdminUser } from "../../application/types/admin/AdminUser.js";
import { ISuperAdminRepository } from "../../domain/repositories/superadmin/ISuperAdminRepository.js";
import { UserModel } from "../databases/models/UserModel.js";

export class MongoSuperAdminRepository implements ISuperAdminRepository {
    async findAdmins(search: string | undefined,
        page: number,
        limit: number
    ): Promise<{
        admins: AdminUser[];
        totalRecords: number
    }> {

        const filter: Record<string, unknown> = {
            role: "admin"
        }
        if (search && search.trim()) {
            filter.fullName = {
                $regex: search.trim(),
                $options: "i"
            }
        }

        const skip = (page - 1) * limit

        const [admin, totalRecords] = await Promise.all([
            UserModel.find(filter)
                .select('-password')
                .skip(skip)
                .lean(),

            UserModel.countDocuments(filter)
        ])




        const mappedAdmins: AdminUser[] = admin.map((admin) => ({
            userId: admin._id.toString(),
            fullName: admin.fullName,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            role: admin.role,
            authProvider: admin.authProvider,
            status: admin.status
        }))

        return {
            admins: mappedAdmins,
            totalRecords
        }
    }
}

