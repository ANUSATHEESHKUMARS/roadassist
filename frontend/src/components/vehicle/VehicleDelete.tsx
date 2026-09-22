import React from "react";
import { Trash2, AlertTriangle, Loader2, Car, Hash } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/types/user/vehicle";

export interface DeleteVehicleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: Vehicle | null;
  onConfirm: () => Promise<void> | void;
  isDeleting?: boolean;
}

export const DeleteVehicleDialog: React.FC<DeleteVehicleDialogProps> = ({
  open,
  onOpenChange,
  vehicle,
  onConfirm,
  isDeleting = false,
}) => {
  if (!vehicle) return null;

  return (
    <AlertDialog open={open} onOpenChange={isDeleting ? () => {} : onOpenChange}>
      <AlertDialogContent className="bg-card border border-border text-foreground max-w-md p-6 rounded-2xl shadow-2xl">
        <AlertDialogHeader className="space-y-3">
          {/* Top Warning Icon Header */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/15 border border-destructive/25 flex items-center justify-center text-primary shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <AlertDialogTitle className="text-base font-bold tracking-tight text-foreground">
                Delete Vehicle?
              </AlertDialogTitle>
              <p className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider">
                Permanent Action
              </p>
            </div>
          </div>

          <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
            Are you sure you want to delete this vehicle? This action cannot be undone and will remove all associated document records and roadside assistance links.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Dynamic Vehicle Details Summary Pill */}
        <div className="my-4 p-3.5 rounded-xl bg-secondary/70 border border-border/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
              <Car className="h-3.5 w-3.5 text-primary" />
              <span>
                {vehicle.brand} {vehicle.model}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-background/80 border border-border/60 px-2 py-0.5 rounded-md">
              {vehicle.vehicleType}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-xs">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Hash className="h-3 w-3" />
              <span>Reg Number:</span>
            </span>
            <span className="font-mono font-bold text-foreground">
              {vehicle.registrationNumber}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 sm:gap-2.5 mt-2">
          <AlertDialogCancel
            disabled={isDeleting}
          >
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto h-9 text-xs bg-card border-border hover:bg-muted text-foreground transition-colors cursor-pointer"
            >
              Cancel
            </Button>
          </AlertDialogCancel>

          <Button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="w-full sm:w-auto h-9 text-xs font-semibold bg-destructive text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Vehicle</span>
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};