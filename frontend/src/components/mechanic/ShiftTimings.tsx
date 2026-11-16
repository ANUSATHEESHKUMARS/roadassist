
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
    eveningStartTime: string;
    eveningEndTime: string;

    onChange: (
        field:
            | "morningStartTime"
            | "morningEndTime"
            | "eveningStartTime"
            | "eveningEndTime",
        value: string
    ) => void;
}

export const ShiftTimings: React.FC<ShiftTimingsProps> = ({
    morningStartTime,
    morningEndTime,
    eveningStartTime,
    eveningEndTime,
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
                        <h3 className="font-semibold">Evening Shift</h3>
                        <p className="text-sm text-muted-foreground">
                            Set your evening working hours.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <Input
                                type="time"
                                value={eveningStartTime}
                                onChange={(event) =>
                                    onChange(
                                        "eveningStartTime",
                                        event.target.value
                                    )
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>End Time</Label>
                            <Input
                                type="time"
                                value={eveningEndTime}
                                onChange={(event) =>
                                    onChange(
                                        "eveningEndTime",
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
