
import { useEffect, useState } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from "react-leaflet";
import { useMap as useLeafletMap } from "react-leaflet";

import type { EmergencyLocation } from "../../types/emergencyRequest";

interface EmergencyLocationMapProps {
    location: EmergencyLocation | null;
    onLocationChange: (location: EmergencyLocation | null) => void;
}

interface GPSInfo {
    accuracy: number;
    heading: number | null;
}

const DEFAULT_POSITION: [number, number] = [
    8.5241,
    76.9366,
];

function MapUpdater({
    location,
}: {
    location: EmergencyLocation | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (location) {
            map.setView(
                [location.latitude, location.longitude],
                Math.max(map.getZoom(), 17)
            );
        }
    }, [location?.latitude, location?.longitude, map]);

    return null;
}

function MapClickHandler({
    onLocationChange,
}: {
    onLocationChange: (location: EmergencyLocation) => void;
}) {
    useMapEvents({
        click(event) {
            onLocationChange({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            });
        },
    });

    return null;
}

function RecenterButton({
    location,
}: {
    location: EmergencyLocation | null;
}) {
    const map = useMap();

    const recenter = () => {
        if (!location) return;

        map.setView(
            [location.latitude, location.longitude],
            17,
            { animate: true }
        );
    };

    return (
        <button
            type="button"
            onClick={recenter}
            disabled={!location}
            className="absolute right-3 top-3 z-[1000] rounded-lg
                border bg-white px-3 py-2 text-sm font-medium
                text-gray-800 shadow hover:bg-gray-100
                disabled:cursor-not-allowed disabled:opacity-50"
        >
            Recenter
        </button>
    );
}

export default function EmergencyLocationMap({
    location,
    onLocationChange,
}: EmergencyLocationMapProps) {
    const [gpsInfo, setGpsInfo] = useState<GPSInfo | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setGpsInfo({
                    accuracy: position.coords.accuracy,
                    heading: position.coords.heading,
                });
            },
            (error) => {
                console.error("Location error:", error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 20000,
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const position: [number, number] = location
        ? [location.latitude, location.longitude]
        : DEFAULT_POSITION;

    return (
        <div className="space-y-2">
            <div className="relative h-[350px] w-full overflow-hidden rounded-xl">
                <MapContainer
                    center={position}
                    zoom={location ? 17 : 12}
                    minZoom={3}
                    maxZoom={19}
                    zoomControl
                    scrollWheelZoom
                    doubleClickZoom
                    touchZoom
                    zoomSnap={0.25}
                    zoomDelta={0.5}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        maxZoom={19}
                    />

                    <MapClickHandler
                        onLocationChange={onLocationChange}
                    />

                    <MapUpdater location={location} />

                    <RecenterButton location={location} />

                    {location && (
                        <Marker position={position}>
                            <Popup>
                                Selected emergency location
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {gpsInfo && (
                <div className="text-sm text-muted-foreground">
                    <p>
                        GPS accuracy: approximately ±
                        {Math.round(gpsInfo.accuracy)} metres
                    </p>
                    <p>
                        Direction of travel:{" "}
                        {gpsInfo.heading === null
                            ? "Unavailable"
                            : `${Math.round(gpsInfo.heading)}°`}
                    </p>
                </div>
            )}

            <p className="text-sm text-muted-foreground">
                Zoom in to select a precise location, or click
                anywhere on the map to move the marker.
            </p>
        </div>
    );
}
