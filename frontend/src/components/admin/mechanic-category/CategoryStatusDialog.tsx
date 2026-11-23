
import { Power, AlertTriangle } from "lucide-react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { MechanicCategory } from "@/types/admin/mechanicCategory.types";

interface CategoryStatusDialogProps {
    category: MechanicCategory | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (id: string, isActive: boolean) => Promise<void>;
}

export const CategoryStatusDialog = ({
    category,
    open,
    onOpenChange,
    onConfirm,
}: CategoryStatusDialogProps) => {

    if (!category) return null;

    const nextStatus = !category.isActive;

    const handleConfirm = async () => {
        await onConfirm(category.id, nextStatus);
        onOpenChange(false);
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <AlertDialogContent>

                <AlertDialogHeader>
                    <AlertDialogMedia>
                        <AlertTriangle
                            className="size-6 text-destructive"
                        />
                    </AlertDialogMedia>

                    <AlertDialogTitle>
                        {nextStatus
                            ? "Activate Category?"
                            : "Deactivate Category?"}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        Are you sure you want to{" "}
                        {nextStatus ? "activate" : "deactivate"}{" "}
                        <strong className="text-foreground">
                            {category.name}
                        </strong>?

                        {nextStatus
                            ? " Mechanics will be able to select this category again."
                            : " Mechanics will no longer be able to select this category."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={false}>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={
                            nextStatus
                                ? ""
                                : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        }
                    >
                        <Power className="mr-2 size-4" />

                        {nextStatus
                            ? "Activate"
                            : "Deactivate"}
                    </AlertDialogAction>
                </AlertDialogFooter>

            </AlertDialogContent>
        </AlertDialog>
    );
};
