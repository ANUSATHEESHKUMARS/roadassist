import React, { useEffect, useState } from "react";
import type{ AdminUser, UserStats } from "@/types/admin/user";
import { UserManagementHeader } from "@/components/admin/user/UserMangementHeader";
import { UserStatsCards } from "@/components/admin/user/UserStatsCards";
import { UserSearchAndFilters } from "@/components/admin/user/UserSearchAndFilters";
import { UserTable } from "@/components/admin/user/UserTable";
import { UserPagination } from "@/components/admin/user/UserPagination";
import { getAdminUser } from "@/services/admin/adminUserService";


export default function AdminUserPage () {
  const [users , setUsers] = useState<AdminUser[]>([])
  const [isloading , setIsLoading] = useState(true)
  const [error , setError] = useState<string | null>(null)


   const fetchUsers = async (seachValue = "") =>{
      try{
        setIsLoading(true)
        setError(null);

        const data = await getAdminUser(seachValue);

        setUsers(data)
      }catch(error){
        console.log('failed to fetch admin users:', error)
        setError("Failed to load users")
      }finally {
        setIsLoading(false)
      }
    }
  useEffect(() => {
   
    fetchUsers()
  },[])

  const stats : UserStats = {
    totalUsers : users.length,
    activeUsers:users.filter(user => user.status == "active").length,
    blockedUsers:users.filter(user => user.status == "blocked").length,
    adminUsers:users.filter(user => user.role == "admin").length
  }

    if (error) {
        return (
            <div className="space-y-6">

                <UserManagementHeader />

                <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
                    <p className="text-sm text-destructive">
                        {error}
                    </p>
                </div>

            </div>
        );
    }


    return (
        <div className="space-y-6">

            {/* Header */}
            <UserManagementHeader />

            {/* Real Statistics */}
            <UserStatsCards stats={stats} />

            {/* Search / Filters */}
            <UserSearchAndFilters onSearch={fetchUsers} />

            {/* Real Users */}
            <UserTable
                users={users}
                isLoading={isloading}
            />

            {/* Pagination */}
            <UserPagination
                currentPage={1}
                totalPages={1}
                totalRecords={users.length}
            />

        </div>
    );
}