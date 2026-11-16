
import { useEffect } from "react";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
} from "react-leaflet";

import type { EmergencyLocation } from "../../types/emergencyRequest";

interface MechanicLiveLocation {
    latitude: number;
    longitude: number;
    accuracy: number;
    updatedAt: string;
}

interface EmergencyTrackingMapProps {
    customerLocation: EmergencyLocation | null;
    mechanicLocation: MechanicLiveLocation | null;
}

const DEFAULT_POSITION: [number, number] = [8.5241, 76.9366];

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

                {customerLocation && (
                    <Marker
                        position={[
                            customerLocation.latitude,
                            customerLocation.longitude,
                        ]}
                    >
                        <Popup>
                            Your emergency location
                        </Popup>
                    </Marker>
                )}

                {mechanicLocation && (
                    <Marker
                        position={[
                            mechanicLocation.latitude,
                            mechanicLocation.longitude,
                        ]}
                    >
                        <Popup>
                            Mechanic's live location
                        </Popup>
                    </Marker>
                )}

            </MapContainer>

        </div>
    );
}
