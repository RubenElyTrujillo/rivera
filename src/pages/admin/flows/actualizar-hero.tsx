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

const heroSlideSchema = z.object({
  titleLine1: z.string().min(1, "La primera línea del título es requerida"),
  titleLine2: z.string().min(1, "La segunda línea del título es requerida"),
  subtitle: z.string().min(1, "El subtítulo es requerido"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).default("center"),
});

type HeroDraft = z.infer<typeof heroSlideSchema>;

interface HeroSlide extends HeroDraft {
  id?: string;
}

const STEPS = [
  { label: "Seleccionar slide", description: "Elegir cuál modificar" },
  { label: "Editar contenido", description: "Texto y enlace" },
  { label: "Cambiar imagen", description: "Nueva fotografía" },
  { label: "Revisar", description: "Verificar cambios" },
  { label: "Guardar", description: "Aplicar modificaciones" },
];

export default function ActualizarHeroFlow() {
  const router = useRouter();
  const { checking } = useAdminAuth();
  const { currentStep, onNext, onBack } = useGuidedFlow(STEPS);
  const { draft, updateDraft, clearDraft } = useAdminDraft<HeroDraft>(
    "draft:actualizar-hero",
    {
      titleLine1: "",
      titleLine2: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      textAlign: "center",
    }
  );

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escapeDialogOpen, setEscapeDialogOpen] = useState(false);

  const handleExitConfirm = () => {
    clearDraft();
    router.push("/admin/hero-slides");
  };

  const handleSaveAndExit = () => {
    // Draft is auto-saved, just navigate
    router.push("/admin/hero-slides");
  };

  useEffect(() => {
    fetch("/api/content/hero-slides")
      .then((res) => res.json())
      .then((data) => {
        setSlides(data);
        if (data.length > 0) {
          const firstSlide = data[0];
          updateDraft({
            titleLine1: firstSlide.titleLine1 || "",
            titleLine2: firstSlide.titleLine2 || "",
            subtitle: firstSlide.subtitle || "",
            description: firstSlide.description || "",
            imageUrl: firstSlide.imageUrl || "",
            textAlign: firstSlide.textAlign || "center",
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading slides:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSelectSlide = (index: number) => {
    setSelectedSlideIndex(index);
    const slide = slides[index];
    if (slide) {
      updateDraft({
        titleLine1: slide.titleLine1 || "",
        titleLine2: slide.titleLine2 || "",
        subtitle: slide.subtitle || "",
        description: slide.description || "",
        imageUrl: slide.imageUrl || "",
        textAlign: slide.textAlign || "center",
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const updatedSlides = slides.map((slide, idx) =>
        idx === selectedSlideIndex
          ? { ...slide, ...draft }
          : slide
      );
      const res = await fetch("/api/content/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSlides),
      });
      if (res.ok) {
        clearDraft();
        router.push("/admin/hero-slides");
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

  if (checking || isLoading) {
    return null;
  }

  return (
    <>
      <Head><title>Actualizar Hero — Admin Rivera</title></Head>
      <PageHeader
        title="Actualizar Hero"
        subtitle="Modifica el carrusel principal del sitio"
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
          {/* Step 0: Seleccionar slide */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">Selecciona el slide que deseas modificar:</p>
              {slides.length === 0 ? (
                <p className="text-sm text-[hsl(0,0%,55%)]">No hay slides disponibles</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {slides.map((slide, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSlide(index)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedSlideIndex === index
                          ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,45%)]/5"
                          : "border-[hsl(0,0%,88%)] hover:border-[hsl(20,60%,45%)]"
                      }`}
                    >
                      <span className="font-medium block">Slide {index + 1}</span>
                      <span className="text-xs text-[hsl(0,0%,55%)] truncate block">
                        {slide.titleLine1 || "Sin título"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 1: Editar contenido */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título (línea 1)</label>
                <input
                  type="text"
                  value={draft.titleLine1}
                  onChange={(e) => updateDraft({ titleLine1: e.target.value })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Primera línea del título"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Título (línea 2)</label>
                <input
                  type="text"
                  value={draft.titleLine2}
                  onChange={(e) => updateDraft({ titleLine2: e.target.value })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Segunda línea del título"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subtítulo</label>
                <input
                  type="text"
                  value={draft.subtitle}
                  onChange={(e) => updateDraft({ subtitle: e.target.value })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Texto corto debajo del título"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={draft.description || ""}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Descripción adicional del hero..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Alineación del texto</label>
                <select
                  value={draft.textAlign}
                  onChange={(e) => updateDraft({ textAlign: e.target.value as "left" | "center" | "right" })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                >
                  <option value="left">Izquierda</option>
                  <option value="center">Centro</option>
                  <option value="right">Derecha</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Cambiar imagen */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">URL de la imagen</label>
                <input
                  type="text"
                  value={draft.imageUrl || ""}
                  onChange={(e) => updateDraft({ imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="https://..."
                />
              </div>
              {draft.imageUrl && (
                <div className="mt-4">
                  <p className="text-xs text-[hsl(0,0%,55%)] mb-2">Vista previa:</p>
                  <div className="relative w-full h-48 bg-[hsl(0,0%,95%)] rounded-lg overflow-hidden">
                    <img
                      src={draft.imageUrl}
                      alt="Vista previa"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="text-xs text-[hsl(0,0%,55%)]">
                La carga de imágenes desde archivo se implementará próximamente.
              </p>
            </div>
          )}

          {/* Step 3: Revisar */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">Resumen de cambios:</p>
              <div className="bg-[hsl(0,0%,95%)] rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Slide:</span>
                  <span className="text-sm font-medium">{selectedSlideIndex + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Título:</span>
                  <span className="text-sm font-medium">{draft.titleLine1 || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Subtítulo:</span>
                  <span className="text-sm font-medium">{draft.subtitle || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Alineación:</span>
                  <span className="text-sm font-medium">{draft.textAlign}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Imagen:</span>
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {draft.imageUrl ? "Configurada" : "No configurada"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Guardar */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">
                ¿Estás seguro de que deseas guardar los cambios en el slide {selectedSlideIndex + 1}?
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 bg-[hsl(20,60%,45%)] text-white rounded-lg font-medium hover:bg-[hsl(20,60%,40%)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
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
