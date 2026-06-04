import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useAdminAuth, PageHeader } from "@/components/admin/adminUtils";
import { GuidedFlowStepper } from "@/components/admin/guided-flows/GuidedFlowStepper";
import { FlowProgress } from "@/components/admin/guided-flows/FlowProgress";
import { FlowEscapeDialog } from "@/components/admin/guided-flows/FlowEscapeDialog";
import { useGuidedFlow } from "@/hooks/admin/useGuidedFlow";
import { useAdminDraft } from "@/hooks/admin/useAdminDraft";
import { z } from "zod";

const proyectoSchema = z.object({
  title: z.string().min(2, "El título es requerido"),
  city: z.string().optional(),
  colonia: z.string().optional(),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  featured: z.boolean().default(false),
  area: z.number().optional(),
  subcategoriaId: z.number().optional(),
  ambientes: z.array(z.string()).default([]),
});

type ProyectoDraft = z.infer<typeof proyectoSchema>;

const STEPS = [
  { label: "Información básica", description: "Nombre y ubicación" },
  { label: "Detalles", description: "Descripción del proyecto" },
  { label: "Imágenes", description: "Fotos del proyecto" },
  { label: "Documentos", description: "Planos y documentos" },
  { label: "Revisar", description: "Verificar toda la información" },
  { label: "Publicar", description: "Confirmar y guardar" },
];

export default function AgregarProyectoFlow() {
  const router = useRouter();
  const { checking } = useAdminAuth();
  const { currentStep, onNext, onBack } = useGuidedFlow(STEPS);
  const { draft, updateDraft, clearDraft } = useAdminDraft<ProyectoDraft>(
    "draft:agregar-proyecto",
    {
      title: "",
      city: "",
      colonia: "",
      description: "",
      coverImage: "",
      featured: false,
      area: undefined,
      subcategoriaId: undefined,
      ambientes: [],
    }
  );

  const [subcategorias, setSubcategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escapeDialogOpen, setEscapeDialogOpen] = useState(false);

  const handleExitConfirm = () => {
    clearDraft();
    router.push("/admin/proyectos");
  };

  const handleSaveAndExit = () => {
    // Draft is auto-saved, just navigate
    router.push("/admin/proyectos");
  };

  useEffect(() => {
    fetch("/api/catalog/subcategorias")
      .then((res) => res.json())
      .then(setSubcategorias)
      .catch(console.error);
  }, []);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/proyectos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (res.ok) {
        clearDraft();
        router.push("/admin/proyectos");
      }
    } catch (error) {
      console.error("Error submitting:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    // Draft is auto-saved via useAdminDraft on every field change
  };

  if (checking) {
    return null;
  }

  return (
    <>
      <Head><title>Agregar Proyecto — Admin Rivera</title></Head>
      <PageHeader
        title="Agregar Proyecto"
        subtitle="Registra un nuevo proyecto en el portfolio"
      />

      <div className="bg-white border border-[hsl(0,0%,88%)] rounded-xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <FlowProgress currentStep={currentStep} totalSteps={STEPS.length} stepLabel="Paso" />
          <button
            type="button"
            onClick={() => setEscapeDialogOpen(true)}
            className="text-sm text-[hsl(0,0%,50%)] hover:text-[hsl(0,0%,13%)] transition-colors"
          >
            Salir
          </button>
        </div>

        <GuidedFlowStepper
          steps={STEPS}
          currentStep={currentStep}
          onNext={onNext}
          onBack={onBack}
          onSave={handleSaveDraft}
          isSaving={isSubmitting}
        >
          {/* Step 0: Información básica */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título del proyecto</label>
                <input
                  type="text"
                  value={draft.title}
                  onChange={(e) => updateDraft({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Instalación en Casa Moderna"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={draft.city || ""}
                    onChange={(e) => updateDraft({ city: e.target.value })}
                    className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                    placeholder="Ciudad de México"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Colonia / Zona</label>
                  <input
                    type="text"
                    value={draft.colonia || ""}
                    onChange={(e) => updateDraft({ colonia: e.target.value })}
                    className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                    placeholder="Polanco"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Material usado</label>
                <select
                  value={draft.subcategoriaId || ""}
                  onChange={(e) => updateDraft({ subcategoriaId: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                >
                  <option value="">Seleccionar material</option>
                  {subcategorias.map((sub) => (
                    <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 1: Detalles */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={draft.description || ""}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Describe el proyecto..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Área (m²)</label>
                <input
                  type="number"
                  value={draft.area || ""}
                  onChange={(e) => updateDraft({ area: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="45"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={draft.featured}
                  onChange={(e) => updateDraft({ featured: e.target.checked })}
                  className="w-4 h-4 text-[hsl(20,60%,45%)] border-[hsl(0,0%,88%)] rounded focus:ring-[hsl(20,60%,45%)]"
                />
                <label htmlFor="featured" className="text-sm">Marcar como destacado</label>
              </div>
            </div>
          )}

          {/* Step 2: Imágenes */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">
                La carga de imágenes se implementará en el siguiente paso.
              </p>
              <div className="border-2 border-dashed border-[hsl(0,0%,88%)] rounded-lg p-8 text-center">
                <p className="text-sm text-[hsl(0,0%,55%)]">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Documentos */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">
                Agrega planos, certificados u otros documentos relacionados.
              </p>
              <div className="border-2 border-dashed border-[hsl(0,0%,88%)] rounded-lg p-8 text-center">
                <p className="text-sm text-[hsl(0,0%,55%)]">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Revisar */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">Resumen del proyecto:</p>
              <div className="bg-[hsl(0,0%,95%)] rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Título:</span>
                  <span className="text-sm font-medium">{draft.title || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Ubicación:</span>
                  <span className="text-sm font-medium">
                    {[draft.colonia, draft.city].filter(Boolean).join(", ") || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Material:</span>
                  <span className="text-sm font-medium">
                    {subcategorias.find((s) => s.id === draft.subcategoriaId)?.nombre || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Área:</span>
                  <span className="text-sm font-medium">{draft.area ? `${draft.area} m²` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Destacado:</span>
                  <span className="text-sm font-medium">{draft.featured ? "Sí" : "No"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Publicar */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">
                ¿Estás seguro de que deseas crear este proyecto?
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 bg-[hsl(20,60%,45%)] text-white rounded-lg font-medium hover:bg-[hsl(20,60%,40%)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Crear Proyecto"}
              </button>
            </div>
          )}
        </GuidedFlowStepper>
      </div>

      <FlowEscapeDialog
        open={escapeDialogOpen}
        onOpenChange={setEscapeDialogOpen}
        onConfirm={handleExitConfirm}
        onSaveAndExit={handleSaveAndExit}
      />
    </>
  );
}
