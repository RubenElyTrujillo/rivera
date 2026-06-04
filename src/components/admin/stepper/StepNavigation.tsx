import { ChevronLeft, ChevronRight, Save } from "lucide-react";

export interface StepNavigationProps {
  onNext: () => void;
  onBack: () => void;
  onSave: () => void;
  isSaving?: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function StepNavigation({
  onNext,
  onBack,
  onSave,
  isSaving = false,
  isFirstStep,
  isLastStep,
}: StepNavigationProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-t border-[hsl(0,0%,90%)]">
      <button
        type="button"
        onClick={onBack}
        disabled={isFirstStep || isSaving}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[hsl(0,0%,13%)] bg-white border border-[hsl(0,0%,13%)] rounded hover:bg-[hsl(0,0%,95%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} />
        Anterior
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[hsl(0,0%,50%)] rounded hover:bg-[hsl(0,0%,40%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save size={16} />
          {isSaving ? "Guardando..." : "Guardar"}
        </button>

        {!isLastStep && (
          <button
            type="button"
            onClick={onNext}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[hsl(20,60%,45%)] rounded hover:bg-[hsl(20,60%,38%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        )}

        {isLastStep && (
          <button
            type="button"
            onClick={onNext}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[hsl(140,60%,40%)] rounded hover:bg-[hsl(140,60%,35%)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Finalizar
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
