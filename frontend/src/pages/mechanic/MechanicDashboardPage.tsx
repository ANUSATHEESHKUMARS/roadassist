import { useCallback, useEffect, useState } from "react";
import type { ElementType } from "react";
import type { EmergencyRequestDetail } from "@/types/emergencyRequest";
import { mechanicEmergencyService } from "@/services/mechanic/mechanicEmergencyService";
import { useToast } from "@/components/ui/toast/ToastProvider";

import {
    Activity,
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    MapPinned,
    Navigation,
    Settings,
    ShieldCheck,
    UserRound,
    Wrench,
    XCircle,
    BriefcaseBusiness,
    Power,
    ArrowLeftRight,
    Loader2,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type ActivePage = "dashboard" | "service-requests";

export default function MechanicDashboardPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();

    const user = useAuthStore((state) => state.user);
    const switchRole = useAuthStore((state) => state.switchRole);

    const canSwitchToUser = user?.roles?.includes("user") ?? false;

    const handleRoleSwitch = () => {
        if (!canSwitchToUser) return;
        void switchRole("user");
        navigate("/user", { replace: true });
    };

    // Determine active page from URL
    const activePage: ActivePage = location.pathname.includes(
        "service-requests"
    )
        ? "service-requests"
        : "dashboard";

    // ── Availability ──────────────────────────────────────────────
    const [isOnline, setIsOnline] = useState(false);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    // ── Location ──────────────────────────────────────────────────
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [locationCoords, setLocationCoords] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationLabel, setLocationLabel] = useState("Location not enabled");
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");

    // ── Nearby requests (shown on dashboard overview) ─────────────
    const [nearbyRequests, setNearbyRequests] = useState<
        EmergencyRequestDetail[]
    >([]);
    const [nearbyLoading, setNearbyLoading] = useState(false);

    // Fetch nearby requests when online
    const fetchNearby = useCallback(async () => {
        if (!isOnline) return;
        setNearbyLoading(true);
        try {
            const data =
                await mechanicEmergencyService.getNearbyRequests();
            setNearbyRequests(data);
        } catch {
            // Silently handle — will retry on interval
        } finally {
            setNearbyLoading(false);
        }
    }, [isOnline]);

    useEffect(() => {
        if (!isOnline) {
            setNearbyRequests([]);
            return;
        }
        void fetchNearby();
        const interval = setInterval(() => void fetchNearby(), 15_000);
        return () => clearInterval(interval);
    }, [isOnline, fetchNearby]);

    // Toggle availability via API
    const handleAvailabilityChange = async () => {
        if (isOnline) {
            // Going offline
            setAvailabilityLoading(true);
            try {
                await mechanicEmergencyService.updateAvailability(
                    false,
                    locationCoords?.latitude ?? 0,
                    locationCoords?.longitude ?? 0
                );
                setIsOnline(false);
                setLocationError("");
                showToast("You are now offline.", "info");
            } catch {
                showToast("Failed to go offline.", "error");
            } finally {
                setAvailabilityLoading(false);
            }
            return;
        }

        // Going online — need location first
        if (!locationEnabled || !locationCoords) {
            setLocationError(
                "Enable your location before going online."
            );
            return;
        }

        setAvailabilityLoading(true);
        try {
            await mechanicEmergencyService.updateAvailability(
                true,
                locationCoords.latitude,
                locationCoords.longitude
            );
            setIsOnline(true);
            setLocationError("");
            showToast(
                "You are now online! Nearby requests will appear.",
                "success"
            );
        } catch {
            showToast("Failed to go online.", "error");
        } finally {
            setAvailabilityLoading(false);
        }
    };

    // Enable/refresh geolocation
    const handleEnableLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                "Geolocation is not supported by this browser."
            );
            return;
        }

        setLocationLoading(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocationEnabled(true);
                setLocationCoords({ latitude, longitude });
                setLocationLabel(
                    `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                );
                setLocationLoading(false);
            },
            (err) => {
                setLocationLoading(false);
                if (err.code === err.PERMISSION_DENIED) {
                    setLocationError(
                        "Location permission was denied. Allow location access in your browser settings."
                    );
                } else {
                    setLocationError(
                        "Unable to get your location. Please try again."
                    );
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    // Navigate sidebar
    const handleSidebarClick = (page: ActivePage) => {
        if (page === "service-requests") {
            navigate("/mechanic/service-requests");
        } else {
            navigate("/mechanic/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="flex min-h-screen">
                {/* Dashboard Sidebar */}
                <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
                    <div className="flex h-16 items-center gap-3 border-b border-border px-5">
                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Wrench className="size-5" />
                        </div>

                        <div>
                            <p className="text-sm font-bold">RoadAssist</p>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Mechanic Portal
                            </p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1 p-3">
                        <SidebarItem
                            icon={Activity}
                            label="Dashboard"
                            active={activePage === "dashboard"}
                            onClick={() => handleSidebarClick("dashboard")}
                        />
                        <SidebarItem
                            icon={BriefcaseBusiness}
                            label="Service Requests"
                            active={activePage === "service-requests"}
                            onClick={() =>
                                handleSidebarClick("service-requests")
                            }
                            badge={
                                nearbyRequests.length > 0
                                    ? nearbyRequests.length
                                    : undefined
                            }
                        />
                        <SidebarItem
                            icon={CalendarDays}
                            label="Bookings"
                        />
                        <SidebarItem
                            icon={UserRound}
                            label="My Profile"
                        />
                    </nav>

                    <div className="border-t border-border p-3">
                        <SidebarItem icon={Settings} label="Settings" />
                    </div>
                </aside>

                {/* Main Content */}
                <div className="min-w-0 flex-1">
                    {/* Header */}
                    <header className="flex min-h-16 items-center justify-between gap-3 border-b border-border px-3 py-2 sm:px-6">
                        <div>
                            <p className="text-sm font-semibold">
                                Mechanic Dashboard
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Manage your roadside assistance services
                            </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative"
                                aria-label="Notifications"
                            >
                                <Bell className="size-4" />
                                {nearbyRequests.length > 0 && (
                                    <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                                )}
                            </Button>

                            <div className="hidden min-w-0 items-center gap-2 sm:flex">
                                <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted">
                                    <UserRound className="size-4 text-muted-foreground" />
                                </div>

                                <div className="min-w-0">
                                    <p className="max-w-32 truncate text-xs font-semibold">
                                        {user?.fullName ?? "Mechanic"}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                        Verified Partner
                                    </p>
                                </div>
                            </div>

                            {canSwitchToUser && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRoleSwitch}
                                    className="gap-2 whitespace-nowrap"
                                    aria-label="Switch to User portal"
                                >
                                    <ArrowLeftRight className="size-4" />
                                    <span className="hidden sm:inline">
                                        Switch to User
                                    </span>
                                </Button>
                            )}
                        </div>
                    </header>

                    {/* Dashboard Content */}
                    <main className="space-y-6 p-4 sm:p-6 lg:p-8">
                        {/* Welcome */}
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">
                                    Welcome back,{" "}
                                    {user?.fullName ?? "Mechanic"}
                                </h1>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Here's what's happening with your
                                    services today.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck className="size-4 text-primary" />
                                Verified Mechanic
                            </div>
                        </div>

                        {/* Availability and Location */}
                        <Card className="border-primary/20">
                            <CardContent className="p-4 sm:p-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                                                isOnline
                                                    ? "bg-emerald-500/10 text-emerald-400"
                                                    : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            <Power className="size-5" />
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="font-semibold">
                                                    Mechanic Availability
                                                </h2>

                                                <span
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                                                        isOnline
                                                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                            : "border-border bg-muted text-muted-foreground"
                                                    }`}
                                                >
                                                    {isOnline
                                                        ? "ONLINE"
                                                        : "OFFLINE"}
                                                </span>
                                            </div>

                                            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
                                                {isOnline
                                                    ? "You are visible to nearby customers and can receive service requests."
                                                    : "Go online when you're ready to receive nearby service requests."}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAvailabilityChange}
                                        variant={
                                            isOnline ? "outline" : "default"
                                        }
                                        className="w-full sm:w-auto"
                                        disabled={availabilityLoading}
                                    >
                                        {availabilityLoading ? (
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                        ) : (
                                            <Power className="mr-2 size-4" />
                                        )}
                                        {isOnline
                                            ? "Go Offline"
                                            : "Go Online"}
                                    </Button>
                                </div>

                                <div className="mt-5 grid gap-3 border-t border-border pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                                    <div className="flex min-w-0 items-start gap-3">
                                        <MapPinned className="mt-0.5 size-4 shrink-0 text-primary" />

                                        <div className="min-w-0">
                                            <p className="text-sm font-medium">
                                                Your Current Location
                                            </p>
                                            <p className="mt-1 break-all text-xs text-muted-foreground">
                                                {locationLabel}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Service radius: 5 km
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEnableLocation}
                                        disabled={locationLoading}
                                        className="w-full sm:w-auto"
                                    >
                                        <MapPin className="mr-2 size-4" />
                                        {locationLoading
                                            ? "Getting Location..."
                                            : locationEnabled
                                              ? "Refresh Location"
                                              : "Enable Location"}
                                    </Button>
                                </div>

                                {locationError && (
                                    <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                                        {locationError}
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Statistics (real counts from nearby data) */}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <StatCard
                                label="Nearby Requests"
                                value={
                                    nearbyLoading
                                        ? "..."
                                        : String(
                                              nearbyRequests.length
                                          ).padStart(2, "0")
                                }
                                description={
                                    isOnline
                                        ? "Within 5 km radius"
                                        : "Go online to see"
                                }
                                icon={BriefcaseBusiness}
                            />
                            <StatCard
                                label="Status"
                                value={isOnline ? "Online" : "Offline"}
                                description={
                                    isOnline
                                        ? "Receiving requests"
                                        : "Not receiving"
                                }
                                icon={CheckCircle2}
                            />
                            <StatCard
                                label="Location"
                                value={
                                    locationEnabled ? "Enabled" : "Disabled"
                                }
                                description={
                                    locationEnabled
                                        ? "GPS active"
                                        : "Enable to go online"
                                }
                                icon={MapPinned}
                            />
                            <StatCard
                                label="Service Radius"
                                value="5 km"
                                description="Default range"
                                icon={Navigation}
                            />
                        </div>

                        {/* Nearby Requests Overview (when online) */}
                        {isOnline && (
                            <div className="grid gap-4 xl:grid-cols-3">
                                <Card className="xl:col-span-2">
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div>
                                            <CardTitle>
                                                Nearby Emergency Requests
                                            </CardTitle>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Requests within your service
                                                radius
                                            </p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                navigate(
                                                    "/mechanic/service-requests"
                                                )
                                            }
                                        >
                                            View All
                                        </Button>
                                    </CardHeader>

                                    <CardContent className="px-0">
                                        {nearbyRequests.length === 0 ? (
                                            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                                                No nearby requests right now.
                                            </p>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full min-w-[520px] text-left text-sm">
                                                    <thead>
                                                        <tr className="border-y border-border bg-muted/40 text-xs text-muted-foreground">
                                                            <th className="px-4 py-3 font-medium">
                                                                Issue
                                                            </th>
                                                            <th className="px-4 py-3 font-medium">
                                                                Category
                                                            </th>
                                                            <th className="px-4 py-3 font-medium">
                                                                Location
                                                            </th>
                                                            <th className="px-4 py-3 font-medium">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>

                                                    <tbody>
                                                        {nearbyRequests
                                                            .slice(0, 5)
                                                            .map(
                                                                (
                                                                    req
                                                                ) => (
                                                                    <tr
                                                                        key={
                                                                            req.id ??
                                                                            req._id
                                                                        }
                                                                        className="border-b border-border last:border-0"
                                                                    >
                                                                        <td className="px-4 py-3 font-medium">
                                                                            {
                                                                                req.issueTitle
                                                                            }
                                                                        </td>
                                                                        <td className="px-4 py-3 text-muted-foreground">
                                                                            {
                                                                                req.emergencyIssueCategory
                                                                            }
                                                                        </td>
                                                                        <td className="max-w-[150px] truncate px-4 py-3 text-xs text-muted-foreground">
                                                                            {req
                                                                                .location
                                                                                .address ??
                                                                                `${req.location.latitude.toFixed(3)}, ${req.location.longitude.toFixed(3)}`}
                                                                        </td>
                                                                        <td className="px-4 py-3">
                                                                            <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[10px] font-medium text-amber-400">
                                                                                {
                                                                                    req.status
                                                                                }
                                                                            </span>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Job Status sidebar */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Request Overview</CardTitle>
                                        <p className="text-xs text-muted-foreground">
                                            Current request status
                                        </p>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <JobStatusRow
                                            icon={Clock3}
                                            label="Pending"
                                            count={
                                                nearbyRequests.filter(
                                                    (r) =>
                                                        r.status ===
                                                        "pending"
                                                ).length
                                            }
                                            color="text-amber-400"
                                        />
                                        <JobStatusRow
                                            icon={Activity}
                                            label="Searching"
                                            count={
                                                nearbyRequests.filter(
                                                    (r) =>
                                                        r.status ===
                                                        "searching"
                                                ).length
                                            }
                                            color="text-blue-400"
                                        />
                                        <JobStatusRow
                                            icon={CheckCircle2}
                                            label="Available"
                                            count={nearbyRequests.length}
                                            color="text-emerald-400"
                                        />
                                        <JobStatusRow
                                            icon={XCircle}
                                            label="Offline"
                                            count={0}
                                            color="text-muted-foreground"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Quick Information */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <Card>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Navigation className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Nearby Assistance
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {isOnline
                                                ? `${nearbyRequests.length} request(s) within your radius.`
                                                : "Go online to become discoverable by customers."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="flex items-center gap-4 p-5">
                                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <CalendarDays className="size-5" />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold">
                                            Service Requests
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {isOnline
                                                ? "Click Service Requests to accept or reject."
                                                : "Go online to view service requests."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SidebarItem({
    icon: Icon,
    label,
    active = false,
    onClick,
    badge,
}: {
    icon: ElementType;
    label: string;
    active?: boolean;
    onClick?: () => void;
    badge?: number;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
        >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {badge}
                </span>
            )}
        </button>
    );
}

function StatCard({
    label,
    value,
    description,
    icon: Icon,
}: {
    label: string;
    value: string;
    description: string;
    icon: ElementType;
}) {
    return (
        <Card>
            <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                    </div>
                </div>

                <p className="mt-3 text-2xl font-bold tracking-tight">
                    {value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}

function JobStatusRow({
    icon: Icon,
    label,
    count,
    color,
}: {
    icon: ElementType;
    label: string;
    count: number;
    color: string;
}) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-3">
                <Icon className={`size-4 ${color}`} />
                <span className="text-sm">{label}</span>
            </div>

            <span className="text-sm font-semibold tabular-nums">
                {count}
            </span>
        </div>
    );
}
