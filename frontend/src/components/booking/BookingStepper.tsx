import { Check } from "lucide-react";
import {
  BOOKING_STEPS,
  type BookingStep,
} from "@/types/user/scheduledBooking";

interface BookingStepperProps {
  currentStep: BookingStep;
  maxReachedIndex: number;
  isLocked: boolean;
  onStepSelect: (step: BookingStep) => void;
}

export function BookingStepper({
  currentStep,
  maxReachedIndex,
  isLocked,
  onStepSelect,
}: BookingStepperProps) {
  const currentIndex = BOOKING_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Booking progress" className="w-full overflow-x-auto pb-2">
      <ol className="flex items-center justify-between min-w-[600px] gap-2">
        {BOOKING_STEPS.map((step, index) => {
          const isCurrent = step.id === currentStep;
          const isCompleted = index < currentIndex;
          const isClickable =
            !isLocked && index <= maxReachedIndex && step.id !== "payment" && step.id !== "confirmation";

          return (
            <li key={step.id} className="flex-1 flex items-center gap-2">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepSelect(step.id)}
                className={`flex items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-colors w-full border ${
                  isCurrent
                    ? "border-primary bg-primary/10 text-foreground"
                    : isCompleted
                      ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                      : "border-border bg-card text-muted-foreground"
                } ${isClickable ? "cursor-pointer hover:border-primary/50" : "cursor-default"}`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : isCompleted
                        ? "bg-emerald-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="text-xs font-semibold truncate">
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
