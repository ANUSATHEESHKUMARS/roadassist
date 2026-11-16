
import React from "react";
import { IndianRupee } from "lucide-react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

const shiftPrices = [
    {
        title: "Morning Shift",
        description: "Morning",
        price: 700,
    },
    {
        title: "Evening Shift",
        description: "Evening",
        price: 700,
    },
    {
        title: "Full Day",
        description: "Morning + Evening",
        price: 1400,
    },
];

export const ScheduleSummary: React.FC = () => {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shiftPrices.map((shift) => (
                <Card key={shift.title}>
                    <CardContent className="flex items-center justify-between p-5">
                        <div>
                            <h3 className="font-semibold">
                                {shift.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {shift.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 text-lg font-bold">
                            <IndianRupee className="h-4 w-4" />
                            {shift.price}
                        </div>
                    </CardContent>
                </Card>
            ))}

            <p className="text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
                Full Day availability is derived from both Morning and
                Evening shifts being enabled. These displayed prices
                are informational; the backend should determine the
                actual booking amount.
            </p>
        </div>
    );
};
