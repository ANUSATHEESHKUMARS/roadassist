import { useState } from "react";
import { Outlet } from "react-router-dom";

import { AdminSidebar } from "@/components/admin/layout/AdminSidebar";
import { AdminHeader } from "@/components/admin/layout/AdminHeader";
import { AdminFooter } from "@/components/admin/layout/AdminFooter";

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleOpenSidebar = () => {
        setIsSidebarOpen(true);
    };

    const handleCloseSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* Sidebar */}
            <AdminSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
            />

            {/* Main Content */}
            <div className="min-h-screen md:pl-64">

                {/* Header */}
                <AdminHeader
                    onMenuClick={handleOpenSidebar}
                />

                {/* Page Content */}
                <main className="min-h-[calc(100vh-120px)] p-4 md:p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <AdminFooter />

            </div>

        </div>
    );
}