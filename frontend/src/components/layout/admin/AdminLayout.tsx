import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";

export const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground flex">

            <AdminSidebar />

            <div className="flex-1 flex flex-col min-w-0">

                <AdminHeader />

                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto w-full">
                        <Outlet />
                    </div>
                </main>

            </div>
        </div>
    );
};