
import React, { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAuthStore } from "@/store/authStore";
import { socket } from "@/services/socket/socket";
import { EmergencyVideoCallProvider } from "@/context/EmergencyVideoCallContext";

export const UserLayout: React.FC = () => {
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const isLandingPage =
    pathname === "/" || pathname === "/user";

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      if (socket.connected) {
        socket.disconnect();
      }
    };
  }, [isAuthenticated]);

  return (
    <EmergencyVideoCallProvider role="user">
      <div className="min-h-screen bg-background text-foreground">
        {isLandingPage ? (
          <main className="min-h-screen">
            <Outlet />
          </main>
        ) : (
          // User Dashboard Layout
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex min-w-0 flex-1 flex-col">
              <Header />

              <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <Outlet />
              </main>
            </div>
          </div>
        )}
      </div>
    </EmergencyVideoCallProvider>
  );
};
