import React, { useEffect, useState } from "react";
import {
    CalendarCheck2,
    CalendarClock,
    CheckCircle2,
    Clock,
    LayoutDashboard,
    Loader2,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { mechanicScheduleService } from "@/services/mechanic/mechanicScheduleService";
import type {
    DailySchedule,
    DayOfWeek,
    MechanicSchedule,
} from "@/types/mechanic/mechanicSchedule";

interface ScheduleSuccessLocationState {
    schedule?: MechanicSchedule;
    isNewSchedule?: boolean;
}

const DAY_LABELS: Record<DayOfWeek, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
};

function formatDayShiftLabel(day: DailySchedule): string {
    if (day.morning && day.afternoon) return "Full Day";
    if (day.morning) return "Morning";
    if (day.afternoon) return "Afternoon";
    return "Off";
}

function formatIndiaUpdatedAt(iso?: string): string | null {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export const MechanicScheduleSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const routeState =
        (location.state as ScheduleSuccessLocationState | null) ?? null;

    const [schedule, setSchedule] = useState<MechanicSchedule | null>(
        routeState?.schedule ?? null
    );
    const [loadingSummary, setLoadingSummary] = useState(
        !routeState?.schedule
    );

    useEffect(() => {
        if (routeState?.schedule) {
            setSchedule(routeState.schedule);
            setLoadingSummary(false);
            return;
        }

        let cancelled = false;

        const fetchLatestSchedule = async () => {
            try {
                const persisted = await mechanicScheduleService.getSchedule();
                if (!cancelled) {
                    setSchedule(persisted);
                }
            } catch {
                // Optional summary: omit cleanly on direct visit without throwing or mocking data
                if (!cancelled) {
                    setSchedule(null);
                }
            } finally {
                if (!cancelled) {
                    setLoadingSummary(false);
                }
            }
        };

        void fetchLatestSchedule();
        return () => {
            cancelled = true;
        };
    }, [routeState?.schedule]);

    const enabledDays = (schedule?.weeklyAvailability ?? []).filter(
        (day) => day.morning || day.afternoon
    );
    const dateOverridesCount = schedule?.dateAvailability?.length ?? 0;
    const updatedAtLabel = formatIndiaUpdatedAt(schedule?.updatedAt);

    return (
        <div className="mx-auto max-w-3xl py-4 sm:py-8">
            <Card className="border-border bg-card shadow-lg">
                <CardContent className="space-y-6 p-6 sm:p-8">
                    {/* Confirmation Hero */}
                    <div className="flex flex-col items-center space-y-3 text-center">
                        <div className="flex size-16 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15 text-emerald-400">
                            <CheckCircle2 className="size-9" />
                        </div>

                        <div className="space-y-1.5">
                            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                Schedule Updated Successfully!
                            </h1>
                            <p className="text-sm text-foreground/90">
                                Your working days and service timings have been
                                saved successfully.
                            </p>
                        </div>

                        <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
                            Customers can now discover your availability when
                            booking services matching your active days, shifts,
                            and date-specific calendar schedule.
                        </p>
                    </div>

                    {/* Optional Real Saved Schedule Summary */}
                    {loadingSummary && (
                        <div className="flex items-center justify-center gap-2 rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
                            <Loader2 className="size-4 animate-spin text-primary" />
                            <span>Loading saved schedule summary...</span>
                        </div>
                    )}

                    {!loadingSummary && schedule && (
                        <div className="space-y-4 rounded-xl border border-border bg-secondary/30 p-4 sm:p-5">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                                <div className="flex items-center gap-2">
                                    <CalendarCheck2 className="size-4 text-primary" />
                                    <h2 className="text-sm font-semibold text-foreground">
                                        Saved Schedule Summary
                                    </h2>
                                </div>

                                <span
                                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                                        schedule.isActive
                                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                            : "border-border bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {schedule.isActive
                                        ? "Active Schedule"
                                        : "Inactive Schedule"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
                                <div className="space-y-1">
                                    <p className="text-[11px] text-muted-foreground">
                                        Morning Shift Window
                                    </p>
                                    <p className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <Clock className="size-3.5 text-primary" />
                                        <span>
                                            {schedule.morningStartTime} –{" "}
                                            {schedule.morningEndTime} IST
                                        </span>
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[11px] text-muted-foreground">
                                        Afternoon Shift Window
                                    </p>
                                    <p className="flex items-center gap-1.5 font-semibold text-foreground">
                                        <Clock className="size-3.5 text-primary" />
                                        <span>
                                            {schedule.afternoonStartTime} –{" "}
                                            {schedule.afternoonEndTime} IST
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-border pt-3 text-xs">
                                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                    <span>
                                        Weekly Working Days ({enabledDays.length}
                                        /7 configured)
                                    </span>
                                    {dateOverridesCount > 0 && (
                                        <span>
                                            {dateOverridesCount} date-specific{" "}
                                            {dateOverridesCount === 1
                                                ? "override"
                                                : "overrides"}
                                        </span>
                                    )}
                                </div>

                                {enabledDays.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {enabledDays.map((day) => (
                                            <span
                                                key={day.day}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-foreground"
                                            >
                                                <span className="font-semibold text-primary">
                                                    {DAY_LABELS[day.day]}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    ·{" "}
                                                    {formatDayShiftLabel(day)}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-muted-foreground">
                                        No recurring weekly shifts enabled.
                                    </p>
                                )}

                                {updatedAtLabel && (
                                    <p className="pt-1 text-[11px] text-muted-foreground">
                                        Last saved: {updatedAtLabel} IST
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-center">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate("/mechanic/dashboard")}
                            className="w-full gap-2 sm:w-auto"
                        >
                            <LayoutDashboard className="size-4" />
                            Go to Dashboard
                        </Button>

                        <Button
                            type="button"
                            onClick={() => navigate("/mechanic/schedule")}
                            className="w-full gap-2 sm:w-auto"
                        >
                            <CalendarClock className="size-4" />
                            View My Schedule
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default MechanicScheduleSuccessPage;

