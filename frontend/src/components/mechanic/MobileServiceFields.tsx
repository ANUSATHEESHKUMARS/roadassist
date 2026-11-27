import { MapPin, LocateFixed, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
    serviceAddress: string;
    pincode: string;
    latitude: string;
    longitude: string;
    serviceRadiusKm: string;

    locating: boolean;

    onChange: (
        field:
            | "serviceAddress"
            | "pincode"
            | "latitude"
            | "longitude"
            | "serviceRadiusKm",
        value: string
    ) => void;

    onGetLocation: () => void;
}

export const MobileServiceFields = ({
    serviceAddress,
    pincode,
    latitude,
    longitude,
    serviceRadiusKm,
    locating,
    onChange,
    onGetLocation,
}: Props) => {

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
                        <Label>GPS Coordinates *</Label>

                        <p className="text-sm text-muted-foreground">
                            Use your current location to identify your
                            service area.
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={onGetLocation}
                        disabled={locating}
                    >
                        {locating ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <LocateFixed className="mr-2 h-4 w-4" />
                        )}

                        {locating
                            ? "Getting location..."
                            : "Use My Current Location"}
                    </Button>

                    <div className="grid gap-4 sm:grid-cols-2">

                        <div className="space-y-2">
                            <Label>Latitude</Label>

                            <Input
                                value={latitude}
                                readOnly
                                placeholder="Latitude"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Longitude</Label>

                            <Input
                                value={longitude}
                                readOnly
                                placeholder="Longitude"
                            />
                        </div>

                    </div>

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