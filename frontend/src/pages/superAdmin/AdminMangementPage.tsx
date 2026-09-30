import React, { useEffect, useState } from "react";

import type { AdminUser } from "@/types/admin/user";

import {
    Users,
    UserCheck,
    UserX,
    MoreHorizontal,
    Eye,
    Pencil,
    Ban,
    Trash2,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserSearchAndFilters } from "@/components/admin/user/UserSearchAndFilters";
import { UserPagination } from "@/components/admin/user/UserPagination";
import { StatusBadge } from "@/components/common/StatusBadge";

import { getAdmins } from "@/services/superadmin/superAdmin";


export const AdminManagementPage: React.FC = () => {

    // =========================
    // STATE
    // =========================

    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [pageSize, setPageSize] = useState(10);


    // =========================
    // FETCH ADMINS
    // =========================

    const fetchAdmins = async (
        searchValue: string = search,
        page: number = currentPage,
        limit: number = pageSize
    ) => {

        try {

            setIsLoading(true);
            setError(null);

            const response = await getAdmins(
                searchValue,
                page,
                limit
            );

            setAdmins(response.data);

            setCurrentPage(
                response.pagination.currentPage
            );

            setTotalPages(
                response.pagination.totalPage
            );

            setTotalRecords(
                response.pagination.totalRecords
            );

            setPageSize(
                response.pagination.pageSize
            );

        } catch (error) {

            console.error(
                "Failed to fetch admins:",
                error
            );

            setError("Failed to load admins");

        } finally {

            setIsLoading(false);

        }
    };




    useEffect(() => {

        fetchAdmins();

    }, []);




    const totalAdmins = totalRecords;

    const activeAdmins = admins.filter(
        (admin) => admin.status === "active"
    ).length;

    const blockedAdmins = admins.filter(
        (admin) => admin.status === "blocked"
    ).length;




    const handleSearch = (value: string) => {

        setSearch(value);
        setCurrentPage(1);

        fetchAdmins(
            value,
            1,
            pageSize
        );
    };


    const handlePageChange = (page: number) => {

        fetchAdmins(
            search,
            page,
            pageSize
        );
    };



    const handlePageSizeChange = (size: number) => {

        setPageSize(size);
        setCurrentPage(1);

        fetchAdmins(
            search,
            1,
            size
        );
    };




    const getInitials = (name: string): string => {

        return name
            .split(" ")
            .map((part) => part[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };


    return (
        <div className="space-y-6">

            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className="space-y-1">

                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Admin Management
                </h1>

                <p className="text-sm text-muted-foreground">
                    Manage and monitor administrator accounts across the RoadAssist platform.
                </p>

            </div>


            {/* =========================
                STATISTICS
            ========================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

                {/* TOTAL ADMINS */}

                <Card className="border-border bg-card">

                    <CardContent className="p-5">

                        <div className="flex items-center justify-between">

                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Total Admins
                            </span>

                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                                <Users className="h-4 w-4" />
                            </div>

                        </div>

                        <div className="mt-3">

                            <span className="text-2xl font-bold tracking-tight text-foreground">
                                {totalAdmins}
                            </span>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Platform administrator accounts
                            </p>

                        </div>

                    </CardContent>

                </Card>


                {/* ACTIVE ADMINS */}

                <Card className="border-border bg-card">

                    <CardContent className="p-5">

                        <div className="flex items-center justify-between">

                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Active Admins
                            </span>

                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-foreground">
                                <UserCheck className="h-4 w-4" />
                            </div>

                        </div>

                        <div className="mt-3">

                            <span className="text-2xl font-bold tracking-tight text-foreground">
                                {activeAdmins}
                            </span>

                            <p className="mt-1 text-xs text-muted-foreground">
                                Operational with full access
                            </p>

                        </div>

                    </CardContent>

                </Card>


                {/* BLOCKED ADMINS */}

                <Card className="border-border bg-card">

                    <CardContent className="p-5">

                        <div className="flex items-center justify-between">

                            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                Blocked Admins
                            </span>

                            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                                <UserX className="h-4 w-4" />
                            </div>

                        </div>

                        <div className="mt-3">

                            <span className="text-2xl font-bold tracking-tight text-foreground">
                                {blockedAdmins}
                            </span>

                            <p className="mt-1 text-xs text-destructive">
                                Restricted from dashboard access
                            </p>

                        </div>

                    </CardContent>

                </Card>

            </div>


            {/* =========================
                SEARCH
            ========================= */}

            <UserSearchAndFilters
                onSearch={handleSearch}
            />


            {/* =========================
                LOADING
            ========================= */}

            {isLoading && (
                <div className="rounded-lg border border-border bg-card py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Loading admins...
                    </p>
                </div>
            )}


            {/* =========================
                ERROR
            ========================= */}

            {!isLoading && error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">

                    <p className="text-sm text-destructive">
                        {error}
                    </p>

                </div>
            )}


            {/* =========================
                EMPTY STATE
            ========================= */}

            {!isLoading && !error && admins.length === 0 && (
                <div className="rounded-lg border border-border bg-card py-12 text-center">

                    <p className="text-sm text-muted-foreground">
                        No admins found.
                    </p>

                </div>
            )}


            {/* =========================
                ADMIN TABLE
            ========================= */}

            {!isLoading && !error && admins.length > 0 && (

                <div className="space-y-4">

                    <div className="overflow-hidden rounded-lg border border-border bg-card">

                        <Table>

                            <TableHeader className="bg-muted/40">

                                <TableRow className="border-border hover:bg-transparent">

                                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Admin
                                    </TableHead>

                                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Email
                                    </TableHead>

                                    <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">
                                        Phone
                                    </TableHead>

                                    <TableHead className="hidden text-xs font-medium uppercase tracking-wider text-muted-foreground sm:table-cell">
                                        Auth Provider
                                    </TableHead>

                                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Status
                                    </TableHead>

                                    <TableHead className="text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                        Actions
                                    </TableHead>

                                </TableRow>

                            </TableHeader>


                            <TableBody className="divide-y divide-border font-normal">

                                {admins.map((admin) => (

                                    <TableRow
                                        key={admin.userId}
                                        className="border-border transition-colors hover:bg-muted/30"
                                    >

                                        {/* ADMIN */}

                                        <TableCell className="py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground">
                                                    {getInitials(admin.fullName)}
                                                </div>

                                                <div className="flex flex-col">

                                                    <span className="font-medium text-foreground">
                                                        {admin.fullName}
                                                    </span>

                                                    <span className="text-xs text-muted-foreground">
                                                        Admin ID: {admin.userId}
                                                    </span>

                                                </div>

                                            </div>

                                        </TableCell>


                                        {/* EMAIL */}

                                        <TableCell className="text-xs text-muted-foreground">
                                            {admin.email}
                                        </TableCell>


                                        {/* PHONE */}

                                        <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
                                            {admin.phoneNumber || "—"}
                                        </TableCell>


                                        {/* AUTH PROVIDER */}

                                        <TableCell className="hidden sm:table-cell">

                                            <span className="inline-flex items-center rounded border border-border bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
                                                {admin.authProvider}
                                            </span>

                                        </TableCell>


                                        {/* STATUS */}

                                        <TableCell>

                                            <StatusBadge
                                                status={admin.status}
                                            />

                                        </TableCell>


                                        {/* ACTIONS */}

                                        <TableCell className="text-right">

                                            <DropdownMenu>

                                                <DropdownMenuTrigger>

                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />

                                                        <span className="sr-only">
                                                            Open actions menu
                                                        </span>

                                                    </Button>

                                                </DropdownMenuTrigger>


                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-40 border-border bg-card text-foreground"
                                                >

                                                    <DropdownMenuItem className="cursor-pointer gap-2 text-xs">

                                                        <Eye className="h-3.5 w-3.5 text-muted-foreground" />

                                                        <span>
                                                            View Details
                                                        </span>

                                                    </DropdownMenuItem>


                                                    <DropdownMenuItem className="cursor-pointer gap-2 text-xs">

                                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />

                                                        <span>
                                                            Edit Admin
                                                        </span>

                                                    </DropdownMenuItem>


                                                    <DropdownMenuSeparator className="bg-border" />


                                                    <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive">

                                                        <Ban className="h-3.5 w-3.5" />

                                                        <span>
                                                            {admin.status === "active"
                                                                ? "Block Admin"
                                                                : "Unblock Admin"}
                                                        </span>

                                                    </DropdownMenuItem>


                                                    <DropdownMenuItem className="cursor-pointer gap-2 text-xs text-destructive focus:bg-destructive/10 focus:text-destructive">

                                                        <Trash2 className="h-3.5 w-3.5" />

                                                        <span>
                                                            Delete
                                                        </span>

                                                    </DropdownMenuItem>

                                                </DropdownMenuContent>

                                            </DropdownMenu>

                                        </TableCell>

                                    </TableRow>

                                ))}

                            </TableBody>

                        </Table>

                    </div>


                    {/* =========================
                        PAGINATION
                    ========================= */}
<UserPagination
    currentPage={currentPage}
    totalPages={totalPages}
    totalRecords={totalRecords}
    pageSize={pageSize}
    onPageChange={handlePageChange}
    onPageSizeChange={handlePageSizeChange}
/>

                </div>

            )}

        </div>
    );
};

export default AdminManagementPage;