import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/user/Sidebar";
import { Header } from "@/components/layout/user/Header";

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};