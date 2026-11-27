import { Building2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    workshopName: string;
    workshopAddress: string;

    onChange: (
        field: "workshopName" | "workshopAddress",
        value: string
    ) => void;
}

export const WorkshopServiceFields = ({
    workshopName,
    workshopAddress,
    onChange,
}: Props) => {

    return (
        <Card>
            <CardContent className="space-y-5 p-6">

                <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />

                    <h2 className="text-lg font-semibold">
                        Workshop Details
                    </h2>
                </div>

                <div className="space-y-2">
                    <Label>Workshop Name *</Label>

                    <Input
                        value={workshopName}
                        onChange={(e) =>
                            onChange("workshopName", e.target.value)
                        }
                        placeholder="Enter workshop name"
                    />
                </div>

                <div className="space-y-2">
                    <Label>Workshop Address *</Label>

                    <Input
                        value={workshopAddress}
                        onChange={(e) =>
                            onChange("workshopAddress", e.target.value)
                        }
                        placeholder="Enter complete workshop address"
                    />
                </div>

            </CardContent>
        </Card>
    );
};