
import { useState } from "react";
import type { EmergencyLocation } from "@/types/emergencyRequest";
import { Button } from "@/components/ui/button";
import EmergencyLocationMap from "./EmergencyLocationMap";

interface LocationPickerProps {
    location: EmergencyLocation | null;
    onLocationChange: (location: EmergencyLocation | null) => void;
}

export default function LocationPicker({
    location,
    onLocationChange,
}: LocationPickerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [accuracy, setAccuracy] = useState<number | null>(null)

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Your browser does not support location access.");
            return;
        }

        setLoading(true);
        setError("");
        setAccuracy(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, accuracy } =
                    position.coords;

                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
                console.log("Accuracy:", accuracy, "metres");

                const currentLocation: EmergencyLocation = {
                    latitude,
                    longitude,
                };

                onLocationChange(currentLocation);
                setAccuracy(accuracy);
                setLoading(false);

                if (accuracy > 50) {
                    setError(
                        `GPS accuracy is approximately ±${Math.round(
                            accuracy
                        )} metres. Try again outdoors or adjust the marker on the map.`
                    );
                }
            },
            (geoError) => {
                let message =
                    "Unable to get your location. Please try again.";

                if (geoError.code === geoError.PERMISSION_DENIED) {
                    message =
                        "Location permission was denied. Enable it in your browser settings.";
                } else if (geoError.code === geoError.TIMEOUT) {
                    message =
                        "Location request timed out. Please try again.";
                } else if (
                    geoError.code === geoError.POSITION_UNAVAILABLE
                ) {
                    message =
                        "Your current location is unavailable.";
                }

                setError(message);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
            }
        );
    };

    const clearLocation = () => {
        onLocationChange(null);
        setAccuracy(null)
        setError("");
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                    <h3 className="font-medium text-foreground">
                        Your current location
                    </h3>

                    <p className="text-sm text-muted-foreground">
                        Share your location so nearby mechanics can find you.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={getCurrentLocation}
                    disabled={loading}
                >
                    {loading ? "Getting location..." : "Use my location"}
                </Button>
            </div>

            {location ? (
                <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-muted/40 p-3">
                        <p className="font-medium text-foreground">
                            <span aria-hidden="true" className="mr-2">✓</span>
                            Location captured
                        </p>

                        <p className="mt-2 break-all text-sm text-muted-foreground">
                            Latitude: {location.latitude.toFixed(6)}
                        </p>

                        <p className="break-all text-sm text-muted-foreground">
                            Longitude: {location.longitude.toFixed(6)}
                        </p>
                        {accuracy !== null && (
                            <p className="mt-1 text-sm text-muted-foreground">
                                Estimated accuracy: ±{Math.round(accuracy)} metres
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={clearLocation}
                            className="mt-3 text-sm text-primary underline underline-offset-4"
                        >
                            Clear location
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-medium text-foreground">
                            Confirm your location on the map
                        </h4>

                        <EmergencyLocationMap
                            location={location}
                            onLocationChange={onLocationChange}
                        />          </div>
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                    <p className="font-medium text-foreground">
                        Location not selected
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Select “Use my location” to capture your coordinates.
                    </p>
                </div>
            )}

            {error && (
                <p role="alert" className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
