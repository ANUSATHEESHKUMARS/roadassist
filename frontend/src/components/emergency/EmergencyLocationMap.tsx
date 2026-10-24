
import { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    useMapEvents,
} from "react-leaflet";

import type { EmergencyLocation } from "../../types/emergencyRequest";

interface EmergencyLocationMapProps {
    location: EmergencyLocation | null;
    onLocationChange: (location: EmergencyLocation) => void;
}

const DEFAULT_POSITION: [number, number] = [8.5241, 76.9366];

function MapUpdater({ location }: { location: EmergencyLocation | null }) {
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

function RecenterButton({ location }: { location: EmergencyLocation | null }) {
    const map = useMap();
    return (
        <button
            type="button"
            onClick={() => {
                if (!location) return;
                map.setView([location.latitude, location.longitude], 17, { animate: true });
            }}
            disabled={!location}
            className="absolute right-3 top-3 z-[1000] rounded-lg border bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
            Recenter
        </button>
    );
}

export default function EmergencyLocationMap({
    location,
    onLocationChange,
}: EmergencyLocationMapProps) {
    const center: [number, number] = location
        ? [location.latitude, location.longitude]
        : DEFAULT_POSITION;

    return (
        <div className="space-y-2">
            <div className="relative h-[350px] w-full overflow-hidden rounded-xl border border-border">
                <MapContainer
                    center={center}
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
                    <MapClickHandler onLocationChange={onLocationChange} />
                    <MapUpdater location={location} />
                    <RecenterButton location={location} />
                    {location && (
                        <Marker position={center}>
                            <Popup>
                                {location.address
                                    ? <span style={{ fontSize: "0.8rem" }}>{location.address}</span>
                                    : "Selected emergency location"}
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground">
                Click anywhere on the map to move the pin. The address above will update automatically.
            </p>
        </div>
    );
}
