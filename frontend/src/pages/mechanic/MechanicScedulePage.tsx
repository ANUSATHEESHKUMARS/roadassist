
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    CalendarClock,
    Loader2,
    Save,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast/ToastProvider";

// import { WeeklyAvailability } from "../components/WeeklyAvailability";
import { WeeklyAvailability } from "@/components/mechanic/WeeklyAvailabilty";
import { ShiftTimings } from "@/components/mechanic/ShiftTimings";
import { ScheduleSummary } from "@/components/mechanic/ScheduleSummary";

import { mechanicScheduleService } from "@/services/mechanic/mechanicScheduleService";
import type {
    CreateMechanicScheduleDto,
    DailySchedule,
    DayOfWeek,
    MechanicSchedule,
} from '../../types/mechanic/mechanicSchedule'

const createDefaultAvailability = (): DailySchedule[] => [
    { day: "monday", morning: false, evening: false },
    { day: "tuesday", morning: false, evening: false },
    { day: "wednesday", morning: false, evening: false },
    { day: "thursday", morning: false, evening: false },
    { day: "friday", morning: false, evening: false },
    { day: "saturday", morning: false, evening: false },
    { day: "sunday", morning: false, evening: false },
];

const createInitialForm = (): CreateMechanicScheduleDto => ({
    weeklyAvailability: createDefaultAvailability(),
    morningStartTime: "09:00",
    morningEndTime: "13:00",
    eveningStartTime: "14:00",
    eveningEndTime: "18:00",
    isActive: true,
});

export const MechanicSchedulePage: React.FC = () => {

    const navigate = useNavigate()
    const { showToast } = useToast();

    const [form, setForm] = useState<CreateMechanicScheduleDto>(
        createInitialForm
    );

    const [hasSchedule, setHasSchedule] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

   useEffect(() => {
    const loadSchedule = async () => {
        try {
            const schedule =
                await mechanicScheduleService.getSchedule();

            setForm({
                weeklyAvailability: schedule.weeklyAvailability,
                morningStartTime: schedule.morningStartTime,
                morningEndTime: schedule.morningEndTime,
                eveningStartTime: schedule.eveningStartTime,
                eveningEndTime: schedule.eveningEndTime,
                isActive: schedule.isActive,
            });

            setHasSchedule(true);
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 404
            ) {
                setForm(createInitialForm());
                setHasSchedule(false);
            } else {
                showToast("Unable to load your schedule", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    void loadSchedule();

    // Load the schedule when this page mounts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
    const handleShiftChange = (
        day: DayOfWeek,
        shift: "morning" | "evening",
        checked: boolean
    ) => {
        setForm((previous) => ({
            ...previous,
            weeklyAvailability: previous.weeklyAvailability.map((item) =>
                item.day === day
                    ? { ...item, [shift]: checked }
                    : item
            ),
        }));
    };

    const handleTimeChange = (
        field:
            | "morningStartTime"
            | "morningEndTime"
            | "eveningStartTime"
            | "eveningEndTime",
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const validateForm = (): boolean => {
        const {
            morningStartTime,
            morningEndTime,
            eveningStartTime,
            eveningEndTime,
            weeklyAvailability,
            isActive,
        } = form;

        if (
            !morningStartTime ||
            !morningEndTime ||
            !eveningStartTime ||
            !eveningEndTime
        ) {
            showToast("Please configure all shift timings", "error");
            return false;
        }

        if (morningStartTime >= morningEndTime) {
            showToast("Invalid morning shift timings", "error");
            return false;
        }

        if (eveningStartTime >= eveningEndTime) {
            showToast("Invalid evening shift timings", "error");
            return false;
        }

        if (morningEndTime > eveningStartTime) {
            showToast(
                "Morning and evening shifts cannot overlap",
                "error"
            );
            return false;
        }

        const hasWorkingShift = weeklyAvailability.some(
            (day) => day.morning || day.evening
        );

        if (isActive && !hasWorkingShift) {
            showToast(
                "Select at least one available shift",
                "error"
            );
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        try {
            setSaving(true);

            let savedSchedule: MechanicSchedule;

            if (hasSchedule) {
                savedSchedule =
                    await mechanicScheduleService.updateSchedule(form);
            } else {
                savedSchedule =
                    await mechanicScheduleService.createSchedule(form);
            }

            setForm({
                weeklyAvailability: savedSchedule.weeklyAvailability,
                morningStartTime: savedSchedule.morningStartTime,
                morningEndTime: savedSchedule.morningEndTime,
                eveningStartTime: savedSchedule.eveningStartTime,
                eveningEndTime: savedSchedule.eveningEndTime,
                isActive: savedSchedule.isActive,
            });

            setHasSchedule(true);

            showToast(
                hasSchedule
                    ? "Schedule updated successfully"
                    : "Schedule created successfully",
                "success"
            );
            navigate("/mechanic/service-location");

        } catch (error) {
            const responseData = axios.isAxiosError(error)
                ? error.response?.data as { message?: string } | undefined
                : undefined;

            showToast(
                responseData?.message || "Unable to save schedule",
                "error"
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Page heading */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-2">
                        <CalendarClock className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">
                            My Schedule
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your working days and service timings.
                    </p>
                </div>

                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto"
                >
                    {saving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}

                    {saving
                        ? "Saving..."
                        : hasSchedule
                          ? "Update Schedule"
                          : "Save Schedule"}
                </Button>
            </div>

            {/* Schedule active/inactive */}
            <Card>
                <CardContent className="flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="space-y-1">
                        <Label className="text-base font-semibold">
                            Schedule Status
                        </Label>

                        <p className="text-sm text-muted-foreground">
                            {form.isActive
                                ? "Your schedule is active."
                                : "Your schedule is inactive."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                            {form.isActive ? "Active" : "Inactive"}
                        </span>

                        <Switch
                            checked={form.isActive}
                            onCheckedChange={(checked) =>
                                setForm((previous) => ({
                                    ...previous,
                                    isActive: checked,
                                }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Shift pricing */}
            <ScheduleSummary />

            {/* Weekly working days */}
            <WeeklyAvailability
                weeklyAvailability={form.weeklyAvailability}
                onChange={handleShiftChange}
            />

            {/* Working hours */}
            <ShiftTimings
                morningStartTime={form.morningStartTime}
                morningEndTime={form.morningEndTime}
                eveningStartTime={form.eveningStartTime}
                eveningEndTime={form.eveningEndTime}
                onChange={handleTimeChange}
            />

            {/* Bottom save button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full sm:w-auto"
                >
                    {saving ? "Saving..." : hasSchedule ? "Update Schedule" : "Save Schedule"}
                </Button>
            </div>
        </div>
    );
};
