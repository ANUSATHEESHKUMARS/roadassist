import { useEffect, useState, useCallback } from "react";
import {
    Wrench,
    CalendarCheck,
    Clock,
    Star,
    MapPin,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/toast/ToastProvider";
import {
    getMyMechanicApplication,
} from "@/services/mechanic/mechanicApplicaitonService";
import type { MyMechanicApplicationResponse } from "@/services/mechanic/mechanicApplicaitonService";

type ApplicationData = NonNullable<MyMechanicApplicationResponse["data"]>;

interface StatCardProps {
    label: string;
    value: string;
    icon: React.ReactNode;
    color: string;
    bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
    return (
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                    {label}
                </span>
                <div
                    className={`h-9 w-9 rounded-lg ${bgColor} flex items-center justify-center ${color}`}
                >
                    {icon}
                </div>
            </div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
    );
}

export default function MechanicDashboardPage() {
    const user = useAuthStore((state) => state.user);
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [application, setApplication] = useState<ApplicationData | null>(null);

    const fetchApplication = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMyMechanicApplication();
            setApplication(response.data ?? null);
        } catch (error) {
            console.error("Failed to fetch mechanic data:", error);
            showToast("Failed to load dashboard data.", "error");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        void fetchApplication();
    }, [fetchApplication]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading dashboard...</span>
                </div>
            </div>
        );
    }

    if (!application || application.status !== "approved") {
        return (
            <div className="min-h-[60vh] flex items-center justify-center p-4">
                <div className="w-full max-w-md text-center space-y-5">
                    <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold tracking-tight">
                            Application Not Approved Yet
                        </h2>
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            Your mechanic application is still being processed.
                            You'll get access to the dashboard once approved.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Wrench className="h-4 w-4" />
                    Mechanic Dashboard
                </div>

                <h1 className="mt-2 text-2xl font-bold tracking-tight">
                    Welcome, {user?.fullName ?? "Mechanic"}
                </h1>

                <p className="text-sm text-muted-foreground mt-1">
                    Manage your services, bookings, and profile from here.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Status"
                    value="Active"
                    icon={<CheckCircle2 className="h-4 w-4" />}
                    color="text-emerald-500"
                    bgColor="bg-emerald-500/10"
                />
                <StatCard
                    label="Total Bookings"
                    value="0"
                    icon={<CalendarCheck className="h-4 w-4" />}
                    color="text-blue-500"
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    label="Pending Requests"
                    value="0"
                    icon={<Clock className="h-4 w-4" />}
                    color="text-amber-500"
                    bgColor="bg-amber-500/10"
                />
                <StatCard
                    label="Rating"
                    value="—"
                    icon={<Star className="h-4 w-4" />}
                    color="text-yellow-500"
                    bgColor="bg-yellow-500/10"
                />
            </div>

            {/* Profile Summary */}
            <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4">
                    <h3 className="text-sm font-semibold">Your Mechanic Profile</h3>
                </div>

                <div className="p-4 sm:p-5 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <ProfileItem
                            label="Service Model"
                            value={application.serviceModel ?? "—"}
                        />
                        <ProfileItem
                            label="Experience"
                            value={
                                application.experienceYears
                                    ? `${application.experienceYears} years`
                                    : "—"
                            }
                        />
                        <ProfileItem
                            label="Service Radius"
                            value="—"
                        />
                        <ProfileItem
                            label="Specializations"
                            value={
                                (application.specializations ?? []).join(", ") || "—"
                            }
                        />
                        <ProfileItem
                            label="Supported Vehicles"
                            value={
                                (application.supportedVehicleTypes ?? []).join(", ") || "—"
                            }
                        />
                        <ProfileItem
                            label="Services Offered"
                            value={
                                (application.serviceOffered ?? []).join(", ") || "—"
                            }
                        />
                    </div>

                    {application.serviceAddress && (
                        <div className="flex items-start gap-2 text-sm text-muted-foreground border-t border-border pt-4">
                            <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                            <span>{application.serviceAddress}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Upcoming Bookings placeholder */}
            <div className="rounded-xl border border-border bg-card">
                <div className="border-b border-border p-4">
                    <h3 className="text-sm font-semibold">Upcoming Bookings</h3>
                </div>

                <div className="p-8 text-center">
                    <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                    <p className="text-sm text-muted-foreground mt-3">
                        No upcoming bookings yet.
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                        New bookings from customers will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="min-w-0 space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-sm capitalize break-words">{value}</p>
        </div>
    );
}

