
import React from "react";
import { Outlet } from "react-router-dom";
import { MechanicSidebar } from "@/components/mechanic/MechanicSidebar";
import { MechanicHeader } from "@/components/mechanic/MechanicHeader";

export const MechanicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                <MechanicSidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <MechanicHeader />

                    <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};
