
import { useEffect } from "react";
import L from "leaflet";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap,
} from "react-leaflet";

import type {
    EmergencyLocation,
    MechanicLiveLocation,
} from "../../types/emergencyRequest";

interface EmergencyTrackingMapProps {
    customerLocation: EmergencyLocation | null;
    mechanicLocation: Pick<
        MechanicLiveLocation,
        "latitude" | "longitude" | "accuracy" | "updatedAt"
    > | null;
}

const DEFAULT_POSITION: [number, number] = [8.5241, 76.9366];

const customerPinIcon = L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#dc2626;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.45);color:#fff;font-size:12px;font-weight:700;">C</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
});

const mechanicPinIcon = L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:9999px;background:#10b981;border:3px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.45);color:#fff;font-size:12px;font-weight:700;">M</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
});

function TrackingMapUpdater({
    customerLocation,
    mechanicLocation,
}: EmergencyTrackingMapProps) {
    const map = useMap();

    useEffect(() => {
        const customerPosition = customerLocation
            ? [customerLocation.latitude, customerLocation.longitude] as [number, number]
            : null;

        const mechanicPosition = mechanicLocation
            ? [mechanicLocation.latitude, mechanicLocation.longitude] as [number, number]
            : null;

        if (customerPosition && mechanicPosition) {
            map.fitBounds(
                [customerPosition, mechanicPosition],
                {
                    padding: [50, 50],
                    maxZoom: 16,
                    animate: true,
                }
            );
        } else if (customerPosition) {
            map.setView(customerPosition, 16, { animate: true });
        } else if (mechanicPosition) {
            map.setView(mechanicPosition, 16, { animate: true });
        }
    }, [
        customerLocation?.latitude,
        customerLocation?.longitude,
        mechanicLocation?.latitude,
        mechanicLocation?.longitude,
        map,
    ]);

    return null;
}

export default function EmergencyTrackingMap({
    customerLocation,
    mechanicLocation,
}: EmergencyTrackingMapProps) {

    const initialPosition: [number, number] = customerLocation
        ? [customerLocation.latitude, customerLocation.longitude]
        : DEFAULT_POSITION;

    return (
        <div className="h-[400px] w-full overflow-hidden rounded-xl border border-border">

            <MapContainer
                center={initialPosition}
                zoom={14}
                minZoom={3}
                maxZoom={19}
                scrollWheelZoom
                className="h-full w-full"
            >

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={19}
                />

                <TrackingMapUpdater
                    customerLocation={customerLocation}
                    mechanicLocation={mechanicLocation}
                />

                {customerLocation && mechanicLocation && (
                    <Polyline
                        positions={[
                            [
                                mechanicLocation.latitude,
                                mechanicLocation.longitude,
                            ],
                            [
                                customerLocation.latitude,
                                customerLocation.longitude,
                            ],
                        ]}
                        pathOptions={{
                            color: "#ef4444",
                            weight: 3,
                            dashArray: "6 6",
                            opacity: 0.85,
                        }}
                    />
                )}

                {customerLocation && (
                    <Marker
                        position={[
                            customerLocation.latitude,
                            customerLocation.longitude,
                        ]}
                        icon={customerPinIcon}
                    >
                        <Popup>
                            <div className="text-xs">
                                <p className="font-semibold">Customer Breakdown Location</p>
                                {customerLocation.address && (
                                    <p className="mt-0.5 text-muted-foreground">
                                        {customerLocation.address}
                                    </p>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {mechanicLocation && (
                    <Marker
                        position={[
                            mechanicLocation.latitude,
                            mechanicLocation.longitude,
                        ]}
                        icon={mechanicPinIcon}
                    >
                        <Popup>
                            <div className="text-xs">
                                <p className="font-semibold">Mechanic Live Location</p>
                                <p className="text-muted-foreground">
                                    Updated{" "}
                                    {new Date(
                                        mechanicLocation.updatedAt
                                    ).toLocaleTimeString()}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                )}

            </MapContainer>

        </div>
    );
}
