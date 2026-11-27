import { Building2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import LocationPicker from "@/components/emergency/LocationPicker";
import type { EmergencyLocation } from "@/types/emergencyRequest";

interface Props {
    workshopName: string;
    workshopAddress: string;
    workshopLatitude: string;
    workshopLongitude: string;
    workshopLocationSource?: "gps" | "map" | "manual";
    showRadius?: boolean;
    serviceRadiusKm?: string;

    onChange: (
        field: "workshopName" | "workshopAddress" | "serviceRadiusKm",
        value: string
    ) => void;

    onWorkshopLocationSelect: (loc: EmergencyLocation | null) => void;
}

export const WorkshopServiceFields = ({
    workshopName,
    workshopAddress,
    workshopLatitude,
    workshopLongitude,
    workshopLocationSource,
    showRadius = false,
    serviceRadiusKm = "10",
    onChange,
    onWorkshopLocationSelect,
}: Props) => {
    const parsedLat = Number(workshopLatitude);
    const parsedLng = Number(workshopLongitude);
    const hasCoords =
        workshopLatitude.trim() !== "" &&
        workshopLongitude.trim() !== "" &&
        Number.isFinite(parsedLat) &&
        Number.isFinite(parsedLng);

    return (
        <Card>
            <CardContent className="space-y-5 p-6">
                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />

                    <h2 className="text-lg font-semibold">
                        Workshop Details
                    </h2>
                </div>

                <div className="space-y-2">
                    <Label>Workshop Name *</Label>

                    <Input
                        value={workshopName}
                        onChange={(e) =>
                            onChange("workshopName", e.target.value)
                        }
                        placeholder="Enter workshop name"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Workshop Address *</Label>

                    <Input
                        value={workshopAddress}
                        onChange={(e) =>
                            onChange("workshopAddress", e.target.value)
                        }
                        placeholder="Enter complete workshop address"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Workshop Pin Location *</Label>
                    <p className="text-sm text-muted-foreground">
                        Capture or pin your workshop&apos;s exact location for accurate customer discovery.
                    </p>
                    <LocationPicker
                        location={
                            hasCoords
                                ? {
                                      latitude: parsedLat,
                                      longitude: parsedLng,
                                      address: workshopAddress || undefined,
                                      ...(workshopLocationSource
                                          ? { source: workshopLocationSource }
                                          : {}),
                                  }
                                : null
                        }
                        onLocationChange={onWorkshopLocationSelect}
                    />
                </div>

                {showRadius && (
                    <div className="space-y-2">
                        <Label>Discovery Radius (KM) *</Label>
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
                            Customers within this distance from your workshop can discover you.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
