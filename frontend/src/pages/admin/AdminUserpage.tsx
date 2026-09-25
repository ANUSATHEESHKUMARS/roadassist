import React, { useEffect, useState } from "react";
import type { AdminUser, UserStats } from "@/types/admin/user";
import { UserManagementHeader } from "@/components/admin/user/UserMangementHeader";
import { UserStatsCards } from "@/components/admin/user/UserStatsCards";
import { UserSearchAndFilters } from "@/components/admin/user/UserSearchAndFilters";
import { UserTable } from "@/components/admin/user/UserTable";
import { UserPagination } from "@/components/admin/user/UserPagination";
import { getAdminUser } from "@/services/admin/adminUserService";


export default function AdminUserPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isloading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalpage, setTotalPage] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [pageSize, setPageSize] = useState(10)


  const fetchUsers = async (
    searchValue: string = search,
    page: number = currentPage,
    limit: number = pageSize
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getAdminUser(
        searchValue,
        page,
        limit
      );

      setUsers(response.data);

      setCurrentPage(response.pagination.currentPage);
      setTotalPage(response.pagination.totalPage);
      setTotalRecords(response.pagination.totalRecords);
      setPageSize(response.pagination.pageSize);

    } catch (error) {
      console.log("failed to fetch admin users:", error);
      setError("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };
  const handlePageChange = (page: number) => {
  fetchUsers(search, page, pageSize);
};

const handleSearch = (value: string) => {
  setSearch(value);
  setCurrentPage(1);

  fetchUsers(value, 1, pageSize);
};

const handlePageSizeChange = (size: number) => {
  setPageSize(size);
  setCurrentPage(1);

  fetchUsers(search, 1, size);
};
  useEffect(() => {

    fetchUsers()
  }, [])

  const stats: UserStats = {
    totalUsers: users.length,
    activeUsers: users.filter(user => user.status == "active").length,
    blockedUsers: users.filter(user => user.status == "blocked").length,
    adminUsers: users.filter(user => user.role == "admin").length
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
     <UserSearchAndFilters onSearch={handleSearch} />

<UserTable
  users={users}
  isLoading={isloading}
/>

<UserPagination
  currentPage={currentPage}
  totalPages={totalpage}
  totalRecords={totalRecords}
  pageSize={pageSize}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
    </div>
  );
}