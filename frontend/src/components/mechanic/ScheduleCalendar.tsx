import React, { useEffect, useMemo, useState } from "react";
import {
    Calendar as CalendarIcon,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Loader2,
    RotateCcw,
    Save,
    Trash2,
    XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast/ToastProvider";

import type {
    CreateMechanicScheduleDto,
    DateAvailability,
    MechanicBookedDate,
} from "@/types/mechanic/mechanicSchedule";
import {
    buildMonthCalendarGrid,
    formatDateKeyReadable,
    formatMonthTitle,
    getIndiaTodayDateKey,
    getMonthKey,
    parseDateKeyParts,
    resolveFrontendDateAvailability,
} from "@/utils/mechanicScheduleCalendar";

const WEEKDAY_HEADERS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ScheduleCalendarProps {
    schedule: CreateMechanicScheduleDto;
    dateAvailability: DateAvailability[];
    bookedDates: MechanicBookedDate[];
    hasSavedSchedule: boolean;
    loadingBookedDates?: boolean;
    onMonthChange: (monthKey: string) => void;
    onSaveDateAvailability: (entry: DateAvailability) => Promise<void>;
    onRemoveDateAvailability: (dateKey: string) => Promise<void>;
}

interface DateEditorState {
    isAvailable: boolean;
    morning: boolean;
    afternoon: boolean;
    useCustomTimings: boolean;
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;
}

export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    schedule,
    dateAvailability,
    bookedDates,
    hasSavedSchedule,
    loadingBookedDates = false,
    onMonthChange,
    onSaveDateAvailability,
    onRemoveDateAvailability,
}) => {
    const { showToast } = useToast();

    const todayKey = useMemo(() => getIndiaTodayDateKey(), []);
    const initialParts = useMemo(() => parseDateKeyParts(todayKey), [todayKey]);

    const [viewYear, setViewYear] = useState(initialParts.year);
    const [viewMonthIndex0, setViewMonthIndex0] = useState(
        initialParts.monthIndex0
    );
    const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
    const [savingDate, setSavingDate] = useState(false);

    const gridCells = useMemo(
        () => buildMonthCalendarGrid(viewYear, viewMonthIndex0),
        [viewYear, viewMonthIndex0]
    );

    const bookedMap = useMemo(() => {
        const map = new Map<string, MechanicBookedDate[]>();
        for (const item of bookedDates) {
            const list = map.get(item.date) ?? [];
            list.push(item);
            map.set(item.date, list);
        }
        return map;
    }, [bookedDates]);

    const resolvedSelected = useMemo(
        () =>
            resolveFrontendDateAvailability(
                schedule,
                dateAvailability,
                selectedDateKey
            ),
        [schedule, dateAvailability, selectedDateKey]
    );

    const createEditorStateFromResolved = (): DateEditorState => ({
        isAvailable: resolvedSelected.isAvailable,
        morning: resolvedSelected.morning,
        afternoon: resolvedSelected.afternoon,
        useCustomTimings: Boolean(
            resolvedSelected.override?.morningStartTime ||
                resolvedSelected.override?.morningEndTime ||
                resolvedSelected.override?.afternoonStartTime ||
                resolvedSelected.override?.afternoonEndTime
        ),
        morningStartTime: resolvedSelected.morningStartTime,
        morningEndTime: resolvedSelected.morningEndTime,
        afternoonStartTime: resolvedSelected.afternoonStartTime,
        afternoonEndTime: resolvedSelected.afternoonEndTime,
    });

    const [editor, setEditor] = useState<DateEditorState>(
        createEditorStateFromResolved
    );

    useEffect(() => {
        setEditor(createEditorStateFromResolved());
        // Sync editor whenever selected date or saved overrides/weekly timings change
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        selectedDateKey,
        dateAvailability,
        schedule.morningStartTime,
        schedule.morningEndTime,
        schedule.afternoonStartTime,
        schedule.afternoonEndTime,
        schedule.isActive,
        schedule.weeklyAvailability,
    ]);

    const navigateMonth = (delta: number) => {
        const nextUtc = new Date(Date.UTC(viewYear, viewMonthIndex0 + delta, 1));
        const nextYear = nextUtc.getUTCFullYear();
        const nextMonthIndex0 = nextUtc.getUTCMonth();
        setViewYear(nextYear);
        setViewMonthIndex0(nextMonthIndex0);
        onMonthChange(getMonthKey(nextYear, nextMonthIndex0));
    };

    const handleJumpToday = () => {
        setViewYear(initialParts.year);
        setViewMonthIndex0(initialParts.monthIndex0);
        setSelectedDateKey(todayKey);
        onMonthChange(getMonthKey(initialParts.year, initialParts.monthIndex0));
    };

    const handleSaveSelectedDate = async () => {
        if (!hasSavedSchedule) {
            showToast(
                "Please save your base weekly schedule before adding date-specific overrides.",
                "info"
            );
            return;
        }

        if (selectedDateKey < todayKey) {
            showToast("Cannot configure availability for a past date.", "error");
            return;
        }

        if (editor.isAvailable && !editor.morning && !editor.afternoon) {
            showToast(
                "Enable at least Morning or Afternoon shift, or mark the date unavailable.",
                "error"
            );
            return;
        }

        if (editor.isAvailable && editor.useCustomTimings) {
            if (editor.morning) {
                if (!editor.morningStartTime || !editor.morningEndTime) {
                    showToast(
                        "Please enter both Morning start and end times.",
                        "error"
                    );
                    return;
                }
                if (editor.morningStartTime >= editor.morningEndTime) {
                    showToast(
                        "Morning end time must be after start time.",
                        "error"
                    );
                    return;
                }
            }

            if (editor.afternoon) {
                if (!editor.afternoonStartTime || !editor.afternoonEndTime) {
                    showToast(
                        "Please enter both Afternoon start and end times.",
                        "error"
                    );
                    return;
                }
                if (editor.afternoonStartTime >= editor.afternoonEndTime) {
                    showToast(
                        "Afternoon end time must be after start time.",
                        "error"
                    );
                    return;
                }
            }

            const effectiveMorningEnd = editor.morning
                ? editor.morningEndTime
                : schedule.morningEndTime;
            const effectiveAfternoonStart = editor.afternoon
                ? editor.afternoonStartTime
                : schedule.afternoonStartTime;

            if (
                editor.morning &&
                editor.afternoon &&
                effectiveMorningEnd > effectiveAfternoonStart
            ) {
                showToast(
                    "Morning and afternoon custom timings cannot overlap.",
                    "error"
                );
                return;
            }
        }

        const payload: DateAvailability = {
            date: selectedDateKey,
            isAvailable: editor.isAvailable,
            morning: editor.isAvailable ? editor.morning : false,
            afternoon: editor.isAvailable ? editor.afternoon : false,
            ...(editor.isAvailable &&
                editor.useCustomTimings &&
                editor.morning && {
                    morningStartTime: editor.morningStartTime,
                    morningEndTime: editor.morningEndTime,
                }),
            ...(editor.isAvailable &&
                editor.useCustomTimings &&
                editor.afternoon && {
                    afternoonStartTime: editor.afternoonStartTime,
                    afternoonEndTime: editor.afternoonEndTime,
                }),
        };

        try {
            setSavingDate(true);
            await onSaveDateAvailability(payload);
        } finally {
            setSavingDate(false);
        }
    };

    const handleRemoveOverride = async () => {
        if (!resolvedSelected.override) return;
        try {
            setSavingDate(true);
            await onRemoveDateAvailability(selectedDateKey);
        } finally {
            setSavingDate(false);
        }
    };

    const selectedDateBookings = bookedMap.get(selectedDateKey) ?? [];
    const derivedFullDay = editor.isAvailable && editor.morning && editor.afternoon;

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Date-Specific Availability Calendar
                        </CardTitle>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Override your weekly availability for specific calendar dates (IST).
                        </p>
                    </div>

                    {loadingBookedDates && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Syncing bookings...
                        </span>
                    )}
                </div>
            </CardHeader>

            <CardContent className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
                {/* Left: Monthly Calendar */}
                <div className="space-y-4">
                    {/* Month Controls */}
                    <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth(-1)}
                            aria-label="Previous month"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">
                                {formatMonthTitle(viewYear, viewMonthIndex0)}
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleJumpToday}
                                className="h-7 px-2 text-xs text-primary"
                            >
                                Today
                            </Button>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => navigateMonth(1)}
                            aria-label="Next month"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Weekday Headings */}
                    <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {WEEKDAY_HEADERS.map((day) => (
                            <div key={day} className="py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Cells */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {gridCells.map((cell) => {
                            const isPast = cell.dateKey < todayKey;
                            const isToday = cell.dateKey === todayKey;
                            const isSelected = cell.dateKey === selectedDateKey;
                            const bookings = bookedMap.get(cell.dateKey) ?? [];
                            const hasBookings = bookings.length > 0;
                            const resolved = resolveFrontendDateAvailability(
                                schedule,
                                dateAvailability,
                                cell.dateKey
                            );
                            const isOverride = resolved.source === "date_override";

                            return (
                                <button
                                    key={cell.dateKey}
                                    type="button"
                                    disabled={isPast}
                                    onClick={() => setSelectedDateKey(cell.dateKey)}
                                    className={`relative flex min-h-[58px] flex-col items-center justify-between rounded-xl border p-1.5 text-xs transition-all ${
                                        isPast
                                            ? "cursor-not-allowed border-border/40 bg-muted/20 text-muted-foreground/40"
                                            : isSelected
                                              ? "cursor-pointer border-primary bg-primary/15 ring-2 ring-primary text-foreground"
                                              : resolved.isAvailable
                                                ? "cursor-pointer border-emerald-500/30 bg-emerald-500/5 text-foreground hover:border-emerald-500/60"
                                                : "cursor-pointer border-border bg-card text-muted-foreground hover:border-primary/40"
                                    } ${!cell.isCurrentMonth && !isPast ? "opacity-60" : ""} ${
                                        isToday && !isSelected
                                            ? "ring-1 ring-primary/70"
                                            : ""
                                    }`}
                                >
                                    <div className="flex w-full items-center justify-between px-0.5">
                                        <span
                                            className={`font-semibold ${
                                                isToday ? "text-primary" : ""
                                            }`}
                                        >
                                            {cell.dayOfMonth}
                                        </span>

                                        {isOverride && !isPast && (
                                            <span
                                                title="Custom date override"
                                                className="h-1.5 w-1.5 rounded-full bg-amber-400"
                                            />
                                        )}
                                    </div>

                                    {/* Bottom status / booking dots */}
                                    <div className="flex items-center gap-1">
                                        {!isPast && (
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    resolved.isAvailable
                                                        ? "bg-emerald-500"
                                                        : "bg-destructive/60"
                                                }`}
                                                title={
                                                    resolved.isAvailable
                                                        ? "Available"
                                                        : "Unavailable"
                                                }
                                            />
                                        )}

                                        {hasBookings && (
                                            <span
                                                className="rounded bg-blue-500/20 px-1 text-[9px] font-bold text-blue-400"
                                                title={`${bookings.length} booking(s)`}
                                            >
                                                {bookings.length}B
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Calendar Legend */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-[11px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Available
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-destructive/70" />
                            Unavailable
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400" />
                            Custom Override
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="rounded bg-blue-500/20 px-1 text-[9px] font-bold text-blue-400">
                                1B
                            </span>
                            Existing Bookings
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="inline-block h-2.5 w-2.5 rounded border border-primary/80" />
                            Today
                        </span>
                    </div>
                </div>

                {/* Right: Selected Date Editor */}
                <div className="space-y-4 rounded-xl border border-border bg-secondary/20 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
                        <div>
                            <p className="text-sm font-bold text-foreground">
                                {formatDateKeyReadable(selectedDateKey)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {selectedDateKey === todayKey
                                    ? "Today · Asia/Kolkata"
                                    : "Selected Date · Asia/Kolkata"}
                            </p>
                        </div>

                        <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                                resolvedSelected.source === "date_override"
                                    ? "bg-amber-500/15 text-amber-400"
                                    : resolvedSelected.source === "inactive"
                                      ? "bg-destructive/15 text-destructive"
                                      : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {resolvedSelected.source === "date_override"
                                ? "Date Override"
                                : resolvedSelected.source === "inactive"
                                  ? "Schedule Inactive"
                                  : "Weekly Default"}
                        </span>
                    </div>

                    {!hasSavedSchedule && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
                            Save your base weekly schedule first before creating date-specific calendar overrides.
                        </div>
                    )}

                    {/* Existing bookings on selected date */}
                    {selectedDateBookings.length > 0 && (
                        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 space-y-1.5">
                            <p className="text-xs font-semibold text-blue-300">
                                Active Bookings on This Date ({selectedDateBookings.length})
                            </p>
                            <ul className="space-y-1 text-[11px] text-blue-200/90">
                                {selectedDateBookings.map((b) => (
                                    <li
                                        key={b.bookingId}
                                        className="flex items-center justify-between"
                                    >
                                        <span className="capitalize">
                                            {b.slot.replace("_", " ")} shift
                                        </span>
                                        <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] uppercase">
                                            {b.status.replace("_", " ")}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Mark Entire Day Unavailable */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                        <div className="flex items-center gap-2.5">
                            {editor.isAvailable ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                            )}
                            <div>
                                <p className="text-xs font-semibold">
                                    Unavailable for Entire Day
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    Blocks all shifts on {selectedDateKey}.
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={!editor.isAvailable}
                            disabled={!hasSavedSchedule || savingDate}
                            onCheckedChange={(checked) =>
                                setEditor((prev) => ({
                                    ...prev,
                                    isAvailable: !checked,
                                    morning: checked ? false : prev.morning,
                                    afternoon: checked ? false : prev.afternoon,
                                }))
                            }
                        />
                    </div>

                    {/* Shift Toggles */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                            <div>
                                <p className="text-xs font-semibold">
                                    Morning Shift
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {editor.useCustomTimings && editor.morning
                                        ? `${editor.morningStartTime} – ${editor.morningEndTime}`
                                        : `${schedule.morningStartTime} – ${schedule.morningEndTime}`}
                                </p>
                            </div>
                            <Switch
                                checked={editor.isAvailable && editor.morning}
                                disabled={!hasSavedSchedule || savingDate}
                                onCheckedChange={(checked) =>
                                    setEditor((prev) => ({
                                        ...prev,
                                        isAvailable: checked || prev.afternoon,
                                        morning: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                            <div>
                                <p className="text-xs font-semibold">
                                    Afternoon Shift
                                </p>
                                <p className="text-[11px] text-muted-foreground">
                                    {editor.useCustomTimings && editor.afternoon
                                        ? `${editor.afternoonStartTime} – ${editor.afternoonEndTime}`
                                        : `${schedule.afternoonStartTime} – ${schedule.afternoonEndTime}`}
                                </p>
                            </div>
                            <Switch
                                checked={editor.isAvailable && editor.afternoon}
                                disabled={!hasSavedSchedule || savingDate}
                                onCheckedChange={(checked) =>
                                    setEditor((prev) => ({
                                        ...prev,
                                        isAvailable: prev.morning || checked,
                                        afternoon: checked,
                                    }))
                                }
                            />
                        </div>

                        <div className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
                            Derived Status:{" "}
                            <span className="font-semibold text-foreground">
                                {!editor.isAvailable
                                    ? "Unavailable"
                                    : derivedFullDay
                                      ? "Full Day Available (Morning + Afternoon)"
                                      : editor.morning
                                        ? "Morning Only"
                                        : "Afternoon Only"}
                            </span>
                        </div>
                    </div>

                    {/* Optional Custom Shift Timings */}
                    {editor.isAvailable && (editor.morning || editor.afternoon) && (
                        <div className="space-y-3 rounded-lg border border-border bg-card p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <Label className="text-xs font-semibold">
                                        Custom Shift Timings for This Date
                                    </Label>
                                </div>
                                <Switch
                                    checked={editor.useCustomTimings}
                                    disabled={!hasSavedSchedule || savingDate}
                                    onCheckedChange={(checked) =>
                                        setEditor((prev) => ({
                                            ...prev,
                                            useCustomTimings: checked,
                                            morningStartTime: schedule.morningStartTime,
                                            morningEndTime: schedule.morningEndTime,
                                            afternoonStartTime:
                                                schedule.afternoonStartTime,
                                            afternoonEndTime: schedule.afternoonEndTime,
                                        }))
                                    }
                                />
                            </div>

                            {editor.useCustomTimings && (
                                <div className="space-y-3 pt-2 border-t border-border/60">
                                    {editor.morning && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">
                                                    Morning Start
                                                </Label>
                                                <Input
                                                    type="time"
                                                    value={editor.morningStartTime}
                                                    onChange={(e) =>
                                                        setEditor((prev) => ({
                                                            ...prev,
                                                            morningStartTime:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">
                                                    Morning End
                                                </Label>
                                                <Input
                                                    type="time"
                                                    value={editor.morningEndTime}
                                                    onChange={(e) =>
                                                        setEditor((prev) => ({
                                                            ...prev,
                                                            morningEndTime:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {editor.afternoon && (
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">
                                                    Afternoon Start
                                                </Label>
                                                <Input
                                                    type="time"
                                                    value={editor.afternoonStartTime}
                                                    onChange={(e) =>
                                                        setEditor((prev) => ({
                                                            ...prev,
                                                            afternoonStartTime:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[11px]">
                                                    Afternoon End
                                                </Label>
                                                <Input
                                                    type="time"
                                                    value={editor.afternoonEndTime}
                                                    onChange={(e) =>
                                                        setEditor((prev) => ({
                                                            ...prev,
                                                            afternoonEndTime:
                                                                e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Button
                            type="button"
                            onClick={() => void handleSaveSelectedDate()}
                            disabled={!hasSavedSchedule || savingDate}
                            className="flex-1 min-w-[160px]"
                        >
                            {savingDate ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="mr-2 h-4 w-4" />
                            )}
                            Save Date Availability
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            disabled={savingDate}
                            onClick={() => setEditor(createEditorStateFromResolved())}
                            title="Reset unsaved edits"
                        >
                            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                            Reset
                        </Button>

                        {resolvedSelected.override && (
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!hasSavedSchedule || savingDate}
                                onClick={() => void handleRemoveOverride()}
                                className="w-full text-xs text-destructive hover:text-destructive"
                            >
                                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                Remove Override (Restore Weekly Default)
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

