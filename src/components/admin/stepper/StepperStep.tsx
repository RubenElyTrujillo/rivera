export interface StepperStepProps {
  children: React.ReactNode;
  isActive?: boolean;
  stepNumber?: number;
}

export function StepperStep({
  children,
  isActive = false,
  stepNumber,
}: StepperStepProps) {
  return (
    <div className={isActive ? "block" : "hidden"}>
      {stepNumber !== undefined && (
        <span className="text-sm font-bold text-[hsl(20,60%,45%)]">
          {stepNumber}
        </span>
      )}
      {children}
    </div>
  );
}
