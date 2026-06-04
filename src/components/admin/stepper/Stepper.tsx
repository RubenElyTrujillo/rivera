import { ChevronLeft, ChevronRight } from "lucide-react";

export interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  isSaving?: boolean;
  onSave?: () => Promise<void>;
  children: React.ReactNode;
}

export function Stepper({
  steps,
  currentStep,
  onNext,
  onBack,
  children,
}: StepperProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="flex flex-col gap-6">
      {/* Step indicators */}
      <ol className="flex items-center justify-between gap-2" role="list">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          return (
            <li
              key={step.label}
              className={`stepper-step flex-1 flex items-center gap-2 ${
                isActive ? "stepper-step--active" : ""
              } ${isCompleted ? "stepper-step--completed" : ""}`}
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold bg-[hsl(0,0%,13%)] text-white">
                {isCompleted ? "✓" : index + 1}
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{step.label}</span>
                {step.description && (
                  <span className="text-xs text-white/50">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Content */}
      <div className="py-4">{children}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isFirstStep}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(0,0%,13%)] bg-white border border-[hsl(0,0%,13%)] rounded hover:bg-[hsl(0,0%,95%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLastStep}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[hsl(20,60%,45%)] rounded hover:bg-[hsl(20,60%,38%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
