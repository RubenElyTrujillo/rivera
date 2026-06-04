import { useState, useCallback } from "react";

export interface GuidedFlowStep {
  label: string;
  description?: string;
}

export interface UseGuidedFlowReturn {
  currentStep: number;
  steps: GuidedFlowStep[];
  isFirstStep: boolean;
  isLastStep: boolean;
  onNext: () => void;
  onBack: () => void;
  goToStep: (step: number) => void;
  reset: () => void;
}

export function useGuidedFlow(steps: GuidedFlowStep[]): UseGuidedFlowReturn {
  const [currentStep, setCurrentStep] = useState(0);

  const onNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const onBack = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setCurrentStep(Math.max(0, Math.min(step, steps.length - 1)));
    },
    [steps.length]
  );

  const reset = useCallback(() => {
    setCurrentStep(0);
  }, []);

  return {
    currentStep,
    steps,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === steps.length - 1,
    onNext,
    onBack,
    goToStep,
    reset,
  };
}
