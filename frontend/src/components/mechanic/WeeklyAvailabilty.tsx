
import React from "react";
import { CalendarDays } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import type {
    DailySchedule,
    DayOfWeek,
} from "../../types/mechanic/mechanicSchedule"

interface WeeklyAvailabilityProps {
    weeklyAvailability: DailySchedule[];
    onChange: (
        day: DayOfWeek,
        shift: "morning" | "evening",
        checked: boolean
    ) => void;
}

const days: { label: string; value: DayOfWeek }[] = [
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
    { label: "Sunday", value: "sunday" },
];

export const WeeklyAvailability: React.FC<WeeklyAvailabilityProps> = ({
    weeklyAvailability,
    onChange,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Weekly Availability
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                    Select the days and shifts when you are available.
                </p>
            </CardHeader>

            <CardContent className="space-y-3">
                {days.map((day) => {
                    const schedule = weeklyAvailability.find(
                        (item) => item.day === day.value
                    );

                    const morning = schedule?.morning ?? false;
                    const evening = schedule?.evening ?? false;

                    return (
                        <div
                            key={day.value}
                            className="grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_1fr]"
                        >
                            <div className="flex items-center">
                                <span className="font-medium">
                                    {day.label}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm">Morning</span>
                                <Switch
                                    checked={morning}
                                    onCheckedChange={(checked) =>
                                        onChange(
                                            day.value,
                                            "morning",
                                            checked
                                        )
                                    }
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm">Evening</span>
                                <Switch
                                    checked={evening}
                                    onCheckedChange={(checked) =>
                                        onChange(
                                            day.value,
                                            "evening",
                                            checked
                                        )
                                    }
                                />
                            </div>

                            <p className="text-xs text-muted-foreground sm:col-span-3">
                                {morning && evening
                                    ? "Full Day available"
                                    : morning
                                        ? "Morning only"
                                        : evening
                                            ? "Evening only"
                                            : "Not available"}
                            </p>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
};
