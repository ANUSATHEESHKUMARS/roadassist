
import { useEffect, useRef, useState } from "react";
import { socket } from "@/services/socket/socket"

export interface MechanicLiveLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
    heading: number | null;
    speed: number | null;
}

interface UseMechanicLocationReturn {
    location: MechanicLiveLocation | null;
    error: string | null;
    isTracking: boolean;
}

interface MechanicLocationError {
    message: string;
}

const useMechanicLocation = (
    enabled: boolean,
    requestId: string | undefined
): UseMechanicLocationReturn => {

    const [location, setLocation] =
        useState<MechanicLiveLocation | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [isTracking, setIsTracking] = useState(false);

    // Keep the latest location available for socket reconnection.
    const latestLocation = useRef<MechanicLiveLocation | null>(null);

    useEffect(() => {

        if (!enabled || !requestId) {
            setIsTracking(false);
            return;
        }

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by this browser.");
            return;
        }

        setError(null);
        setIsTracking(true);

        // Send the latest location to the backend.
        const sendLocation = () => {
            if (!latestLocation.current || !socket.connected) return;

            socket.emit("mechanic_location_update", {
                requestId,
                ...latestLocation.current
            });
        };

        const handleConnect = () => {
            console.log("Mechanic socket connected:", socket.id);
            sendLocation();
        };

        const handleLocationSaved = (data: {
            requestId: string;
            updatedAt: string;
        }) => {
            console.log("Location saved in Redis:", data);
        };

        const handleLocationError = (data: MechanicLocationError) => {
            setError(data.message);
        };

        const handleConnectError = (err: Error) => {
            console.error("Socket connection failed:", err.message);
            setError("Unable to connect to the server.");
        };

        socket.on("connect", handleConnect);
        socket.on("mechanic_location_saved", handleLocationSaved);
        socket.on("mechanic_location_error", handleLocationError);
        socket.on("connect_error", handleConnectError);

        if (!socket.connected) {
            socket.connect();
        }

        const watchId = navigator.geolocation.watchPosition(

            (position) => {
                const { latitude, longitude, accuracy, heading, speed } =
                    position.coords;

                const currentLocation: MechanicLiveLocation = {
                    latitude,
                    longitude,
                    accuracy,
                    heading,
                    speed
                };

                setLocation(currentLocation);
                latestLocation.current = currentLocation;
                setError(null);

                sendLocation();
            },

            (err) => {
                let message = "Unable to retrieve your location.";

                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        message = "Location permission was denied.";
                        break;

                    case err.POSITION_UNAVAILABLE:
                        message = "Location information is unavailable.";
                        break;

                    case err.TIMEOUT:
                        message = "Location request timed out.";
                        break;
                }

                setError(message);
            },

            {
                enableHighAccuracy: true,
                maximumAge: 5000,
                timeout: 15000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);

            socket.off("connect", handleConnect);
            socket.off("mechanic_location_saved", handleLocationSaved);
            socket.off("mechanic_location_error", handleLocationError);
            socket.off("connect_error", handleConnectError);

            latestLocation.current = null;
            setIsTracking(false);
        };

    }, [enabled, requestId]);

    return {
        location,
        error,
        isTracking
    };
};

export default useMechanicLocation;
