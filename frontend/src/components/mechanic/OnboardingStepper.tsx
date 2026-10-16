import React from "react";
import { Check } from "lucide-react";

interface Step {
  id: number;
  title: string;
  description: string;
}

interface OnboardingStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep,
  steps,
}) => {
  return (
    <div className="w-full pb-8">
      {/* Mobile Step Bar */}
      <div className="flex md:hidden flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-primary font-bold">
            STEP {currentStep} OF {steps.length}
          </span>
          <span className="text-muted-foreground">{steps[currentStep - 1]?.title}</span>
        </div>
        <div className="w-full h-1.5 bg-input rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 w-full bg-input z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary transition-all duration-300 z-0"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
                  isCompleted
                    ? "bg-primary border-primary text-primary-foreground shadow-sm"
                    : isActive
                    ? "bg-card border-primary text-primary ring-4 ring-primary/20"
                    : "bg-input border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : step.id}
              </div>
              <div className="text-center mt-2">
                <span
                  className={`text-xs font-semibold block leading-tight ${
                    isActive ? "text-foreground font-bold" : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </span>
                <span className="text-[10px] text-muted-foreground/80 block mt-0.5">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};