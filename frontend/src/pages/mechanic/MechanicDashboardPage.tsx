
import { useState } from "react";
import type { ElementType } from "react";

import {
    Activity,
    Bell,
    CalendarDays,
    CheckCircle2,
    Clock3,
    DollarSign,
    MapPin,
    MapPinned,
    Navigation,
    Settings,
    ShieldCheck,
    Star,

    UserRound,
    Wrench,
    XCircle,
    BriefcaseBusiness,
    Power,
    ArrowLeftRight,
} from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

type Availability = "online" | "offline";

interface DashboardStat {
    label: string;
    value: string;
    description: string;
    icon: ElementType;
}

interface ServiceJob {
    id: string;
    customer: string;
    vehicle: string;
    service: string;
    status: "Pending" | "In Progress" | "Completed";
    amount: string;
}

const stats: DashboardStat[] = [
    {
        label: "Today's Jobs",
        value: "08",
        description: "2 requests waiting",
        icon: BriefcaseBusiness,
    },
    {
        label: "Completed Jobs",
        value: "124",
        description: "+12 this month",
        icon: CheckCircle2,
    },
    {
        label: "Total Earnings",
        value: "₹18,450",
        description: "This month",
        icon: DollarSign,
    },
    {
        label: "Your Rating",
        value: "4.8",
        description: "From 96 customers",
        icon: Star,
    },
];

const recentJobs: ServiceJob[] = [
    {
        id: "RA-1042",
        customer: "Rahul S.",
        vehicle: "Hyundai Creta",
        service: "Battery assistance",
        status: "Completed",
        amount: "₹850",
    },
    {
        id: "RA-1041",
        customer: "Priya M.",
        vehicle: "Maruti Swift",
        service: "Tyre puncture",
        status: "In Progress",
        amount: "₹500",
    },
    {
        id: "RA-1040",
        customer: "Arun K.",
        vehicle: "Honda City",
        service: "Engine inspection",
        status: "Pending",
        amount: "₹300",
    },
    {
        id: "RA-1039",
        customer: "Meera P.",
        vehicle: "Royal Enfield",
        service: "Emergency repair",
        status: "Completed",
        amount: "₹1,200",
    },
];

const statusStyles: Record<ServiceJob["status"], string> = {
    Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "In Progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};
export default function MechanicDashboardPage() {
    const navigate = useNavigate();

    const user = useAuthStore((state) => state.user);
    const switchRole = useAuthStore((state) => state.switchRole);

    // Show the switch only when this account also has the user role.
    // The mechanic dashboard itself already establishes the active portal.
    const canSwitchToUser = user?.roles?.includes("user") ?? false;

    const handleRoleSwitch = () => {
        if (!canSwitchToUser) return;

        switchRole("user");
        navigate("/user", { replace: true });
    };

    // Availability state
    const [availability, setAvailability] =
        useState<Availability>("offline");

    // Location states
    const [locationEnabled, setLocationEnabled] = useState(false);

    const [locationLabel, setLocationLabel] =
        useState("Location not enabled");

    const [locationLoading, setLocationLoading] = useState(false);

    const [locationError, setLocationError] = useState("");

    const isOnline = availability === "online";

    // Toggle mechanic availability
    const handleAvailabilityChange = () => {
        if (isOnline) {
            setAvailability("offline");
            setLocationError("");
            return;
        }

        if (!locationEnabled) {
            setLocationError("Enable your location before going online.");
            return;
        }

        setAvailability("online");
        setLocationError("");
    };

    // Enable mechanic location
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

                setLocationLabel(
                    `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                );

                setLocationLoading(false);
            },
            (error) => {
                setLocationLoading(false);

                if (error.code === error.PERMISSION_DENIED) {
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
                            active
                        />
                        <SidebarItem
                            icon={BriefcaseBusiness}
                            label="Service Requests"
                        />
                        <SidebarItem
                            icon={CalendarDays}
                            label="Bookings"
                        />
                        <SidebarItem
                            icon={DollarSign}
                            label="Earnings"
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

                        {/* Dashboard Title */}
                        <div>
                            <p className="text-sm font-semibold">
                                Mechanic Dashboard
                            </p>

                            <p className="text-xs text-muted-foreground">
                                Manage your roadside assistance services
                            </p>
                        </div>

                        {/* Header Actions */}
                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">

                            {/* Notifications */}
                            <Button
                                variant="outline"
                                size="icon"
                                className="relative"
                                aria-label="Notifications"
                            >
                                <Bell className="size-4" />

                                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-primary" />
                            </Button>

                            {/* Mechanic Profile */}
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

                            {/* Switch to User */}
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
                                    Welcome back, Mechanic
                                </h1>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Here's what's happening with your services today.
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
                                            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${isOnline
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
                                                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${isOnline
                                                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                                        : "border-border bg-muted text-muted-foreground"
                                                        }`}
                                                >
                                                    {isOnline ? "ONLINE" : "OFFLINE"}
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
                                        variant={isOnline ? "outline" : "default"}
                                        className="w-full sm:w-auto"
                                    >
                                        <Power className="mr-2 size-4" />
                                        {isOnline ? "Go Offline" : "Go Online"}
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

                        {/* Statistics */}
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            {stats.map((stat) => {
                                const Icon = stat.icon;

                                return (
                                    <Card key={stat.label}>
                                        <CardContent className="p-4 sm:p-5">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">
                                                    {stat.label}
                                                </p>

                                                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <Icon className="size-4" />
                                                </div>
                                            </div>

                                            <p className="mt-3 text-2xl font-bold tracking-tight">
                                                {stat.value}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {stat.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Work Overview */}
                        <div className="grid gap-4 xl:grid-cols-3">
                            <Card className="xl:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <div>
                                        <CardTitle>Recent Service Jobs</CardTitle>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Your latest roadside assistance activity
                                        </p>
                                    </div>

                                    <Button variant="outline" size="sm">
                                        View All
                                    </Button>
                                </CardHeader>

                                <CardContent className="px-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[620px] text-left text-sm">
                                            <thead>
                                                <tr className="border-y border-border bg-muted/40 text-xs text-muted-foreground">
                                                    <th className="px-4 py-3 font-medium">Job ID</th>
                                                    <th className="px-4 py-3 font-medium">Customer</th>
                                                    <th className="px-4 py-3 font-medium">Service</th>
                                                    <th className="px-4 py-3 font-medium">Status</th>
                                                    <th className="px-4 py-3 font-medium">Amount</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {recentJobs.map((job) => (
                                                    <tr
                                                        key={job.id}
                                                        className="border-b border-border last:border-0"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {job.id}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="font-medium">{job.customer}</p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {job.vehicle}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {job.service}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`inline-flex rounded-full border px-2 py-1 text-[10px] font-medium ${statusStyles[job.status]}`}
                                                            >
                                                                {job.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-semibold">
                                                            {job.amount}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Job Overview</CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Current service status
                                    </p>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <JobStatusRow
                                        icon={Clock3}
                                        label="Pending"
                                        count={2}
                                        color="text-amber-400"
                                    />
                                    <JobStatusRow
                                        icon={Activity}
                                        label="In Progress"
                                        count={3}
                                        color="text-blue-400"
                                    />
                                    <JobStatusRow
                                        icon={CheckCircle2}
                                        label="Completed"
                                        count={8}
                                        color="text-emerald-400"
                                    />
                                    <JobStatusRow
                                        icon={XCircle}
                                        label="Cancelled"
                                        count={1}
                                        color="text-muted-foreground"
                                    />
                                </CardContent>
                            </Card>
                        </div>

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
                                                ? "You're available to receive nearby requests."
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
                                            Upcoming Bookings
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            You have 2 scheduled services today.
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

function SidebarItem({
    icon: Icon,
    label,
    active = false,
}: {
    icon: ElementType;
    label: string;
    active?: boolean;
}) {
    return (
        <button
            type="button"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
        >
            <Icon className="size-4 shrink-0" />
            {label}
        </button>
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
