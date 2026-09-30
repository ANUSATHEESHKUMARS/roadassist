import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: "active" | "blocked";
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
            )}
        >
            {status === "active" ? "Active" : "Blocked"}
        </span>
    );
};