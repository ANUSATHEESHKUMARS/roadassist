import { Card, CardContent } from "@/components/ui/card";

import {
    Smartphone,
    Building2,
    Combine,
} from "lucide-react";

import type {
    MechanicServiceModel,
} from "@/types/mechanic/mechanicapplication";

interface Props {
    value: MechanicServiceModel;
    onChange: (value: MechanicServiceModel) => void;
}

const serviceModels = [
    {
        value: "mobile",
        title: "Mobile Service",
        description: "Travel to the customer's location.",
        icon: Smartphone,
    },
    {
        value: "workshop",
        title: "Workshop",
        description: "Customers visit your workshop.",
        icon: Building2,
    },
    {
        value: "both",
        title: "Both Services",
        description: "Offer mobile and workshop services.",
        icon: Combine,
    },
] as const;

export const ServiceModelSelector = ({
    value,
    onChange,
}: Props) => {

    return (
        <div className="grid gap-4 md:grid-cols-3">

            {serviceModels.map((model) => {
                const Icon = model.icon;
                const selected = value === model.value;

                return (
                    <Card
                        key={model.value}
                        onClick={() => onChange(model.value)}
                        className={`cursor-pointer transition-all ${
                            selected
                                ? "border-primary ring-2 ring-primary/20"
                                : "hover:border-primary/50"
                        }`}
                    >
                        <CardContent className="flex flex-col gap-3 p-5">

                            <div className="flex items-center justify-between">
                                <Icon className="h-7 w-7 text-primary" />

                                <input
                                    type="radio"
                                    checked={selected}
                                    onChange={() => onChange(model.value)}
                                    aria-label={model.title}
                                />
                            </div>

                            <div>
                                <h3 className="font-semibold">
                                    {model.title}
                                </h3>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {model.description}
                                </p>
                            </div>

                        </CardContent>
                    </Card>
                );
            })}

        </div>
    );
};