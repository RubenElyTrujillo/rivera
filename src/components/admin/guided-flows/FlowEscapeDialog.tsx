import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

export interface FlowEscapeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onSaveAndExit?: () => void;
  title?: string;
  description?: string;
}

export function FlowEscapeDialog({
  open,
  onOpenChange,
  onConfirm,
  onSaveAndExit,
  title = "¿Abandonar flujo?",
  description = "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?",
}: FlowEscapeDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-md">
          <Dialog.Title className="text-lg font-bold text-[hsl(0,0%,13%)] mb-2">
            {title}
          </Dialog.Title>
          <Dialog.Description className="text-sm text-[hsl(0,0%,45%)] mb-6">
            {description}
          </Dialog.Description>
          <div className="flex justify-end gap-3">
            {onSaveAndExit && (
              <button
                type="button"
                onClick={onSaveAndExit}
                className="px-4 py-2 text-sm font-medium text-white bg-[hsl(20,60%,45%)] rounded hover:bg-[hsl(20,60%,40%)] transition-colors"
              >
                Guardar y salir
              </button>
            )}
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-[hsl(0,0%,13%)] bg-white border border-[hsl(0,0%,13%)] rounded hover:bg-[hsl(0,0%,95%)] transition-colors"
              >
                Continuar
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-[hsl(0,0%,50%)] rounded hover:bg-[hsl(0,0%,40%)] transition-colors"
            >
              Salir
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
