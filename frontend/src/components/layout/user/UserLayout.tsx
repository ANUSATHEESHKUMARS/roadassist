import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
};