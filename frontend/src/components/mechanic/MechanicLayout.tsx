import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../layout/user/Sidebar";
import { Header } from "../layout/user/Header";

export const MechanicLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                <Sidebar />

                <div className="flex min-w-0 flex-1 flex-col">
                    <Header />

                    <main className="flex-1 p-4 sm:p-6 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};