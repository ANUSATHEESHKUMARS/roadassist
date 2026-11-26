
import React from "react";
import { Clock } from "lucide-react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShiftTimingsProps {
    morningStartTime: string;
    morningEndTime: string;
    afternoonStartTime: string;
    afternoonEndTime: string;

    onChange: (
        field:
            | "morningStartTime"
            | "morningEndTime"
            | "afternoonStartTime"
            | "afternoonEndTime",
        value: string
    ) => void;
}

export const ShiftTimings: React.FC<ShiftTimingsProps> = ({
    morningStartTime,
    morningEndTime,
    afternoonStartTime,
    afternoonEndTime,
    onChange,
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Shift Timings
                </CardTitle>
            </CardHeader>

            <CardContent className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Morning Shift</h3>
                        <p className="text-sm text-muted-foreground">
                            Set your morning working hours.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={morningStartTime}
                                onChange={(event) =>
                                    onChange(
                                        "morningStartTime",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={morningEndTime}
                                onChange={(event) =>
                                    onChange(
                                        "morningEndTime",
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-semibold">Afternoon Shift</h3>
                        <p className="text-sm text-muted-foreground">
                            Set your afternoon working hours.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={afternoonStartTime}
                                onChange={(event) =>
                                    onChange(
                                        "afternoonStartTime",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={afternoonEndTime}
                                onChange={(event) =>
                                    onChange(
                                        "afternoonEndTime",
                                        event.target.value
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
