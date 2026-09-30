import { Outlet } from "react-router-dom";
import { useState } from "react";
import { ShieldCheck, Users, Settings } from "lucide-react";

import Sidebar from "@/components/layout/super/Sidebar";
import Header from "@/components/layout/super/Header";
import Footer from "@/components/layout/super/Footer";

const SuperAdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const superAdminItems = [
        {
            title: "Admin Management",
            href: "/superadmin/admins",
            icon: Users,
        },
        
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">

            {/* Sidebar */}
            <Sidebar
                title="RoadAssist"
                subtitle="Super Admin"
                items={superAdminItems}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Main Area */}
            <div className="flex min-w-0 flex-1 flex-col">

                {/* Header */}
                <Header
                    title="Super Admin"
                    subtitle="Manage the RoadAssist platform"
                    userName="Super Admin"
                    userRole="Super Admin"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="mx-auto w-full max-w-7xl">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <Footer />

            </div>

        </div>
    );
};

export default SuperAdminLayout;