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

const productoSchema = z.object({
  categoriaId: z.number().min(1, "Selecciona una categoría"),
  subcategoriaId: z.number().min(1, "Selecciona una subcategoría"),
  nombre: z.string().min(1, "El nombre es requerido"),
  slug: z.string().min(1, "El slug es requerido"),
  descripcion: z.string().optional(),
  imagenes: z.array(z.string()).optional(),
});

type ProductoDraft = z.infer<typeof productoSchema>;

const STEPS = [
  { label: "Categoría", description: "Seleccionar categoría" },
  { label: "Subcategoría", description: "Seleccionar subcategoría" },
  { label: "Datos básicos", description: "Nombre y slug" },
  { label: "Descripción", description: "Detalles del producto" },
  { label: "Imágenes", description: "Fotos del producto" },
  { label: "Confirmar", description: "Revisar y guardar" },
];

export default function AgregarProductoFlow() {
  const router = useRouter();
  const { checking } = useAdminAuth();
  const { currentStep, isFirstStep, isLastStep, onNext, onBack } = useGuidedFlow(STEPS);
  const { draft, updateDraft, clearDraft, hasDraft } = useAdminDraft<ProductoDraft>(
    "draft:agregar-producto",
    {
      categoriaId: 0,
      subcategoriaId: 0,
      nombre: "",
      slug: "",
      descripcion: "",
      imagenes: [],
    }
  );

  const [categorias, setCategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [subcategorias, setSubcategorias] = useState<{ id: number; nombre: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [escapeDialogOpen, setEscapeDialogOpen] = useState(false);

  const handleExitConfirm = () => {
    clearDraft();
    router.push("/admin/productos");
  };

  const handleSaveAndExit = () => {
    // Draft is auto-saved, just navigate
    router.push("/admin/productos");
  };

  useEffect(() => {
    fetch("/api/catalog/categorias")
      .then((res) => res.json())
      .then(setCategorias)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (draft.categoriaId) {
      fetch(`/api/catalog/subcategorias?categoriaId=${draft.categoriaId}`)
        .then((res) => res.json())
        .then(setSubcategorias)
        .catch(console.error);
    }
  }, [draft.categoriaId]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/catalog/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: draft.nombre,
          slug: draft.slug,
          descripcion: draft.descripcion,
          subcategoriaId: draft.subcategoriaId,
        }),
      });
      if (res.ok) {
        clearDraft();
        router.push("/admin/productos");
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
      <Head><title>Agregar Producto — Admin Rivera</title></Head>
      <PageHeader
        title="Agregar Producto"
        subtitle="Crea una nueva ficha de producto en el catálogo"
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
          {/* Step 0: Seleccionar categoría */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">Selecciona la categoría del producto:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categorias.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => updateDraft({ categoriaId: cat.id, subcategoriaId: 0 })}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      draft.categoriaId === cat.id
                        ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,45%)]/5"
                        : "border-[hsl(0,0%,88%)] hover:border-[hsl(20,60%,45%)]"
                    }`}
                  >
                    <span className="font-medium">{cat.nombre}</span>
                  </button>
                ))}
              </div>
              {draft.categoriaId === 0 && (
                <p className="text-xs text-red-500">Selecciona una categoría para continuar</p>
              )}
            </div>
          )}

          {/* Step 1: Seleccionar subcategoría */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">
                Selecciona la subcategoría:
              </p>
              {subcategorias.length === 0 ? (
                <p className="text-sm text-[hsl(0,0%,55%)]">
                  {draft.categoriaId === 0
                    ? "Primero selecciona una categoría"
                    : "No hay subcategorías disponibles"}
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {subcategorias.map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => updateDraft({ subcategoriaId: sub.id })}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        draft.subcategoriaId === sub.id
                          ? "border-[hsl(20,60%,45%)] bg-[hsl(20,60%,45%)]/5"
                          : "border-[hsl(0,0%,88%)] hover:border-[hsl(20,60%,45%)]"
                      }`}
                    >
                      <span className="font-medium">{sub.nombre}</span>
                    </button>
                  ))}
                </div>
              )}
              {draft.categoriaId === 0 && (
                <p className="text-xs text-red-500">Selecciona primero una categoría</p>
              )}
            </div>
          )}

          {/* Step 2: Datos básicos */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre del producto</label>
                <input
                  type="text"
                  value={draft.nombre}
                  onChange={(e) => updateDraft({ nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Piso Laminado Roble Natural"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input
                  type="text"
                  value={draft.slug}
                  onChange={(e) => updateDraft({ slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="piso-laminado-roble-natural"
                />
                <p className="text-xs text-[hsl(0,0%,55%)] mt-1">
                  Se genera automáticamente del nombre
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Descripción */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={draft.descripcion || ""}
                  onChange={(e) => updateDraft({ descripcion: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-2 border border-[hsl(0,0%,88%)] rounded-lg focus:outline-none focus:border-[hsl(20,60%,45%)]"
                  placeholder="Describe las características del producto..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Imágenes */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">
                La carga de imágenes se integrate en el siguiente paso.
              </p>
              <div className="border-2 border-dashed border-[hsl(0,0%,88%)] rounded-lg p-8 text-center">
                <p className="text-sm text-[hsl(0,0%,55%)]">
                  Arrastra imágenes aquí o haz clic para seleccionar
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Confirmar */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-[hsl(0,0%,45%)]">Resumen del producto:</p>
              <div className="bg-[hsl(0,0%,95%)] rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Nombre:</span>
                  <span className="text-sm font-medium">{draft.nombre || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Slug:</span>
                  <span className="text-sm font-medium">{draft.slug || "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Categoría:</span>
                  <span className="text-sm font-medium">
                    {categorias.find((c) => c.id === draft.categoriaId)?.nombre || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[hsl(0,0%,45%)]">Subcategoría:</span>
                  <span className="text-sm font-medium">
                    {subcategorias.find((s) => s.id === draft.subcategoriaId)?.nombre || "—"}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-3 bg-[hsl(20,60%,45%)] text-white rounded-lg font-medium hover:bg-[hsl(20,60%,40%)] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Crear Producto"}
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
