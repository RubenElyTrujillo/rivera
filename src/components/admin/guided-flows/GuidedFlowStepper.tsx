import { Stepper } from "../stepper/Stepper";

export interface GuidedFlowStepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  onNext: () => void;
  onBack: () => void;
  isSaving?: boolean;
  onSave?: () => Promise<void>;
  children: React.ReactNode;
}

export function GuidedFlowStepper({
  steps,
  currentStep,
  onNext,
  onBack,
  isSaving,
  onSave,
  children,
}: GuidedFlowStepperProps) {
  return (
    <Stepper
      steps={steps}
      currentStep={currentStep}
      onNext={onNext}
      onBack={onBack}
      isSaving={isSaving}
      onSave={onSave}
    >
      {children}
    </Stepper>
  );
}
