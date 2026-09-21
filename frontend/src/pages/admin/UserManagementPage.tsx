import React, { useState } from "react";
import { Upload, Download } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SearchInput } from "@/components/admin/SearchInput";
import { FilterDropdown, FilterIconButton } from "@/components/admin/FilterDropdown";
import { DataTable } from "@/components/admin/DataTable";
import { Pagination } from "@/components/admin/Pagination";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import type { ColumnDef , GetUsersResponseDto} from "@/types/admin";


import { useEffect } from "react";
import { getUsers } from "@/services/adminService";


export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");

 const [users, setUsers] = useState<GetUsersResponseDto[]>([])
const [loading , setloading] = useState(true)
const [error , setError] = useState<string | null>(null)


useEffect(() => {
  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setError("Failed to load users");
    } finally {
      setloading(false);
    }
  };

  fetchUsers();
}, []);

  const columns: ColumnDef<GetUsersResponseDto>[] = [
    {
      key: "profile",
      header: "Profile & ID",
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-secondary border border-border flex items-center justify-center font-semibold text-[11px] text-foreground shrink-0">
            {item.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-foreground leading-tight">
              {item.fullName}
            </div>
            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
              {item.userId}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Customer",
      cell: (item) => (
        <div className="text-xs text-muted-foreground">{item.email}</div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (item) => (
        <div className="font-mono text-xs text-foreground">{item.phoneNumber}</div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      cell: () => <ActionMenu />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        description="Manage all registered users and access their profiles across the platform."
        actions={
          <>
            <Button
              variant="outline"
              className="h-9 bg-card border-border hover:bg-muted text-xs text-foreground flex items-center gap-2"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Export Users</span>
            </Button>
            <Button className="h-9 bg-primary hover:opacity-90 text-primary-foreground text-xs flex items-center gap-2">
              <Download className="h-3.5 w-3.5" />
              <span>Download Report</span>
            </Button>
          </>
        }
      />

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <FilterDropdown label="Status" value="All Status" />
          <FilterDropdown label="Sort" value="Newest First" />
          <FilterIconButton />
        </div>
      </div>

      {/* Data Table */}
      <DataTable columns={columns} data={users} />

      {/* Pagination */}
      <Pagination totalItems={users.length} pageSize={20} currentPage={1} totalPages={1} />
    </div>
  );
}