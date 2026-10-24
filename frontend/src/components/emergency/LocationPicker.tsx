
import { useState, useRef } from "react";
import type { EmergencyLocation } from "@/types/emergencyRequest";
import { Button } from "@/components/ui/button";
import EmergencyLocationMap from "./EmergencyLocationMap";

interface LocationPickerProps {
    location: EmergencyLocation | null;
    onLocationChange: (location: EmergencyLocation | null) => void;
}

type PickerMode = "idle" | "gps" | "manual";

/** Reverse-geocode lat/lng → human-readable address via Nominatim */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
        );
        if (!res.ok) return "";
        const data = await res.json();
        return (data.display_name as string) ?? "";
    } catch {
        return "";
    }
}

/** Forward-geocode an address string → candidate list via Nominatim */
async function forwardGeocode(
    query: string
): Promise<{ display_name: string; lat: string; lon: string }[]> {
    const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error("Search failed");
    return res.json();
}

export default function LocationPicker({
    location,
    onLocationChange,
}: LocationPickerProps) {
    const [mode, setMode] = useState<PickerMode>("idle");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [accuracy, setAccuracy] = useState<number | null>(null);

    // Manual search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<
        { display_name: string; lat: string; lon: string }[]
    >([]);
    const [searching, setSearching] = useState(false);
    const [searchError, setSearchError] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── GPS: use watchPosition to get the most accurate fix ──────────────
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Your browser does not support location access.");
            return;
        }
        setMode("gps");
        setLoading(true);
        setError("");
        setAccuracy(null);

        let bestPos: GeolocationPosition | null = null;
        let watchId: number;

        // Stop after 10 s regardless
        const deadline = setTimeout(() => {
            navigator.geolocation.clearWatch(watchId);
            if (bestPos) {
                void applyPosition(bestPos);
            } else {
                setError("Couldn't get an accurate fix. Try outdoors or search for an address.");
                setLoading(false);
            }
        }, 10_000);

        watchId = navigator.geolocation.watchPosition(
            (pos) => {
                // Keep the best (most accurate) reading
                if (!bestPos || pos.coords.accuracy < bestPos.coords.accuracy) {
                    bestPos = pos;
                }
                // Stop early if accuracy is good enough
                if (pos.coords.accuracy <= 50) {
                    clearTimeout(deadline);
                    navigator.geolocation.clearWatch(watchId);
                    void applyPosition(pos);
                }
            },
            (geoError) => {
                clearTimeout(deadline);
                navigator.geolocation.clearWatch(watchId);
                let msg = "Unable to get your location. Please try again.";
                if (geoError.code === geoError.PERMISSION_DENIED)
                    msg = "Location permission was denied. Enable it in your browser settings.";
                else if (geoError.code === geoError.TIMEOUT)
                    msg = "Location request timed out. Please try again.";
                else if (geoError.code === geoError.POSITION_UNAVAILABLE)
                    msg = "Your current location is unavailable.";
                setError(msg);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 }
        );
    };

    const applyPosition = async (pos: GeolocationPosition) => {
        const { latitude, longitude, accuracy: acc } = pos.coords;
        setAccuracy(acc);
        const address = await reverseGeocode(latitude, longitude);
        onLocationChange({ latitude, longitude, address });
        setLoading(false);
        if (acc > 100) {
            setError(
                `GPS accuracy is approximately ±${Math.round(acc)} m — try outdoors or adjust the pin on the map.`
            );
        } else {
            setError("");
        }
    };

    // ── Address search ────────────────────────────────────────────────────
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        setSearchError("");
        setSearchResults([]);
        try {
            const results = await forwardGeocode(searchQuery.trim());
            if (results.length === 0)
                setSearchError("No locations found. Try a different search term.");
            setSearchResults(results);
        } catch {
            setSearchError("Search failed. Check your connection and try again.");
        } finally {
            setSearching(false);
        }
    };

    const handleSelectResult = (result: { display_name: string; lat: string; lon: string }) => {
        onLocationChange({
            latitude: parseFloat(result.lat),
            longitude: parseFloat(result.lon),
            address: result.display_name,
        });
        setSearchResults([]);
        setSearchQuery("");
    };

    // ── Map click: also reverse-geocode the new pin position ─────────────
    const handleMapLocationChange = async (loc: EmergencyLocation) => {
        const address = await reverseGeocode(loc.latitude, loc.longitude);
        onLocationChange({ ...loc, address });
    };

    const clearLocation = () => {
        onLocationChange(null);
        setAccuracy(null);
        setError("");
        setMode("idle");
        setSearchQuery("");
        setSearchResults([]);
        setSearchError("");
    };

    return (
        <div className="space-y-4">
            {/* ── Action buttons (shown only when no location is set) ── */}
            {!location && (
                <div className="flex flex-col gap-3 sm:flex-row">
                    {/* GPS button */}
                    <Button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                                Getting location…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                                </svg>
                                Use my current location
                            </span>
                        )}
                    </Button>

                    {/* Manual search toggle */}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setMode("manual");
                            setError("");
                            setTimeout(() => searchInputRef.current?.focus(), 50);
                        }}
                        className="flex-1"
                    >
                        <span className="flex items-center gap-2">
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            Search for an address
                        </span>
                    </Button>
                </div>
            )}

            {/* ── Manual address search panel ── */}
            {!location && mode === "manual" && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") { e.preventDefault(); void handleSearch(); }
                            }}
                            placeholder="Type your address, landmark, or area…"
                            className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
                        />
                        <Button
                            type="button"
                            onClick={() => void handleSearch()}
                            disabled={searching || !searchQuery.trim()}
                        >
                            {searching ? "Searching…" : "Search"}
                        </Button>
                    </div>

                    {searchError && (
                        <p className="text-sm text-destructive">{searchError}</p>
                    )}

                    {searchResults.length > 0 && (
                        <ul className="rounded-lg border border-border bg-background shadow-lg overflow-hidden">
                            {searchResults.map((result, i) => (
                                <li key={i}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelectResult(result)}
                                        className="w-full px-4 py-3 text-left text-sm text-foreground hover:bg-muted/50 transition-colors border-b border-border last:border-b-0"
                                    >
                                        {result.display_name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}

                    <p className="text-xs text-muted-foreground">
                        Or click directly on the map below to place your pin.
                    </p>

                    {/* Map visible in manual mode even before pin is placed */}
                    <EmergencyLocationMap
                        location={location}
                        onLocationChange={handleMapLocationChange}
                    />
                </div>
            )}

            {/* ── Empty state (idle) ── */}
            {!location && mode === "idle" && (
                <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
                    <p className="font-medium text-foreground">No location selected</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Use your GPS or search for an address above.
                    </p>
                </div>
            )}

            {/* ── Location captured card ── */}
            {location && (
                <div className="space-y-3">
                    <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">✓</span>
                                <p className="font-semibold text-foreground">Location selected</p>
                            </div>
                            <button
                                type="button"
                                onClick={clearLocation}
                                className="shrink-0 text-xs text-muted-foreground underline underline-offset-4 hover:text-destructive transition-colors"
                            >
                                Change location
                            </button>
                        </div>

                        {/* Human-readable address */}
                        {location.address && (
                            <p className="text-sm text-foreground font-medium leading-snug">
                                📍 {location.address}
                            </p>
                        )}

                        {/* Coordinates and accuracy */}
                        <div className="text-xs text-muted-foreground space-y-0.5">
                            <p>
                                Latitude: {location.latitude.toFixed(6)}&nbsp;&nbsp;·&nbsp;&nbsp;Longitude: {location.longitude.toFixed(6)}
                            </p>
                            {accuracy !== null && (
                                <p>GPS accuracy: ±{Math.round(accuracy)} m</p>
                            )}
                        </div>
                    </div>

                    {/* Map with adjustable pin */}
                    <div className="space-y-1">
                        <h4 className="text-sm font-medium text-foreground">
                            Confirm or adjust your pin on the map
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Click anywhere on the map to move the pin to the exact spot. The address will update automatically.
                        </p>
                        <EmergencyLocationMap
                            location={location}
                            onLocationChange={handleMapLocationChange}
                        />
                    </div>
                </div>
            )}

            {/* ── Error / warning ── */}
            {error && (
                <p role="alert" className="text-sm text-destructive">{error}</p>
            )}
        </div>
    );
}
