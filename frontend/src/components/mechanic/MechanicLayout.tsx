
import React, { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { MechanicSidebar } from "@/components/mechanic/MechanicSidebar";
import { MechanicHeader } from "@/components/mechanic/MechanicHeader";
import { socket } from "@/services/socket/socket";

export const MechanicLayout: React.FC = () => {
    const [newRequestCount, setNewRequestCount] = useState(0);

    const notifiedRequestIds = useRef(new Set<string>());

    const location = useLocation();

    const isServiceRequestsPage = location.pathname.startsWith(
        "/mechanic/service-requests"
    );

    // Manage the shared socket connection
    useEffect(() => {
        const handleConnect = () => {
            console.log("SOCKET CONNECTED:", socket.id);
        };

        const handleConnectError = (error: Error) => {
            console.error("SOCKET CONNECTION ERROR:", error.message);
        };

        const handleDisconnect = (reason: string) => {
            console.log("SOCKET DISCONNECTED:", reason);
        };

        socket.on("connect", handleConnect);
        socket.on("connect_error", handleConnectError);
        socket.on("disconnect", handleDisconnect);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off("connect", handleConnect);
            socket.off("connect_error", handleConnectError);
            socket.off("disconnect", handleDisconnect);

            socket.disconnect();
        };
    }, []);

    // Listen for new emergency requests
    useEffect(() => {
        const handleNewEmergencyRequest = (
            request: { id?: string; _id?: string }
        ) => {
            console.log("NEW EMERGENCY REQUEST RECEIVED:", request);

            const requestId = request.id ?? request._id;

            if (!requestId) {
                console.warn("Request ID missing in socket payload");
                return;
            }

            if (notifiedRequestIds.current.has(requestId)) {
                return;
            }

            notifiedRequestIds.current.add(requestId);

            if (!isServiceRequestsPage) {
                setNewRequestCount(prev => prev + 1);
            }
        };

        socket.on("new_emergency_request", handleNewEmergencyRequest);

        if (isServiceRequestsPage) {
            setNewRequestCount(0);
        }

        return () => {
            socket.off("new_emergency_request", handleNewEmergencyRequest);
        };
    }, [isServiceRequestsPage]);

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                <MechanicSidebar newRequestCount={newRequestCount} />

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
