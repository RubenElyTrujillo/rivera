import * as React from "react";

export interface FlowProgressProps {
  currentStep: number;
  totalSteps: number;
  stepLabel?: string;
  estimatedTime?: string;
}

export function FlowProgress({
  currentStep,
  totalSteps,
  stepLabel = "Paso",
  estimatedTime = "~2 minutos",
}: FlowProgressProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-sm text-[hsl(0,0%,45%)]">
        <span className="font-medium">
          {stepLabel} {currentStep + 1}
        </span>
        <span>de</span>
        <span className="font-medium">{totalSteps}</span>
      </div>
      <span className="text-xs text-[hsl(0,0%,65%)]">{estimatedTime}</span>
    </div>
  );
}
