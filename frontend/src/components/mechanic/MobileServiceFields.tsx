import { MapPin } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import LocationPicker from "@/components/emergency/LocationPicker";
import type { EmergencyLocation } from "@/types/emergencyRequest";

interface Props {
    serviceAddress: string;
    pincode: string;
    latitude: string;
    longitude: string;
    locationSource?: "gps" | "map" | "manual";
    serviceRadiusKm: string;

    onChange: (
        field:
            | "serviceAddress"
            | "pincode"
            | "latitude"
            | "longitude"
            | "serviceRadiusKm",
        value: string
    ) => void;

    onLocationSelect: (loc: EmergencyLocation | null) => void;
}

export const MobileServiceFields = ({
    serviceAddress,
    pincode,
    latitude,
    longitude,
    locationSource,
    serviceRadiusKm,
    onChange,
    onLocationSelect,
}: Props) => {
    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);
    const hasCoords =
        latitude.trim() !== "" &&
        longitude.trim() !== "" &&
        Number.isFinite(parsedLat) &&
        Number.isFinite(parsedLng);

    return (
        <Card>
            <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />

                    <h2 className="text-lg font-semibold">
                        Mobile Service Location
                    </h2>
                </div>

                <div className="space-y-2">
                    <Label>Service Address *</Label>

                    <Input
                        value={serviceAddress}
                        onChange={(e) =>
                            onChange("serviceAddress", e.target.value)
                        }
                        placeholder="Enter your service location"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Pincode *</Label>

                    <Input
                        value={pincode}
                        onChange={(e) =>
                            onChange("pincode", e.target.value)
                        }
                        placeholder="Enter pincode"
                        maxLength={6}
                        inputMode="numeric"
                    />
                </div>

                <div className="space-y-3">
                    <div>
                        <Label>GPS / Map Coordinates *</Label>

                        <p className="text-sm text-muted-foreground">
                            Use your current GPS location, search an address, or adjust your pin on the map.
                        </p>
                    </div>

                    <LocationPicker
                        location={
                            hasCoords
                                ? {
                                      latitude: parsedLat,
                                      longitude: parsedLng,
                                      address: serviceAddress || undefined,
                                      ...(locationSource
                                          ? { source: locationSource }
                                          : {}),
                                  }
                                : null
                        }
                        onLocationChange={onLocationSelect}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Service Radius (KM) *</Label>

                    <Input
                        type="number"
                        min="0.1"
                        max="100"
                        step="0.1"
                        value={serviceRadiusKm}
                        onChange={(e) =>
                            onChange("serviceRadiusKm", e.target.value)
                        }
                        placeholder="Example: 10"
                    />

                    <p className="text-xs text-muted-foreground">
                        Minimum 0.1 KM and maximum 100 KM.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
