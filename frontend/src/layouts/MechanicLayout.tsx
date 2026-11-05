import { useState } from "react";
import { Outlet } from "react-router-dom";

import { MechanicSidebar } from "@/components/mechanic/layout/MechanicSidebar";
import { MechanicHeader } from "@/components/mechanic/layout/MechanicHeader";
import { MechanicFooter } from "@/components/mechanic/layout/MechanicFooter";

export default function MechanicLayout() {
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
            <MechanicSidebar
                isOpen={isSidebarOpen}
                onClose={handleCloseSidebar}
            />

            {/* Main Content */}
            <div className="min-h-screen md:pl-64">

                {/* Header */}
                <MechanicHeader
                    onMenuClick={handleOpenSidebar}
                />

                {/* Page Content */}
                <main className="min-h-[calc(100vh-120px)] p-4 md:p-6">
                    <Outlet />
                </main>

                {/* Footer */}
                <MechanicFooter />

            </div>

        </div>
    );
}

