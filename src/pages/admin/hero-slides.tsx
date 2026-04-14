import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth,
  PageHeader,
  FormCard,
  Field,
  AdminInput,
  AdminTextarea,
  SaveButton,
  useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";
import type { IHeroSlide } from "@/domain/types";

const EMPTY_SLIDE: IHeroSlide = {
  titleLine1: "",
  titleLine2: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  textAlign: "left",
};

export default function AdminHeroSlidesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [slides, setSlides] = useState<IHeroSlide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/content/hero-slides")
      .then((r) => r.json())
      .then((data: IHeroSlide[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
        } else {
          setSlides([{ ...EMPTY_SLIDE }]);
        }
        setLoading(false);
      })
      .catch(() => {
        setSlides([{ ...EMPTY_SLIDE }]);
        setLoading(false);
      });
  }, []);

  const currentSlide = slides[activeIndex] as IHeroSlide | undefined;

  const updateSlide = (field: keyof IHeroSlide, value: string) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === activeIndex ? { ...s, [field]: value } : s))
    );
  };

  const addSlide = () => {
    setSlides((prev) => [...prev, { ...EMPTY_SLIDE }]);
    setActiveIndex(slides.length);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) return;
    const next = slides.filter((_, i) => i !== index);
    setSlides(next);
    setActiveIndex(Math.min(activeIndex, next.length - 1));
  };

  const moveSlide = (from: number, to: number) => {
    const next = [...slides];
    [next[from], next[to]] = [next[to], next[from]];
    setSlides(next);
    setActiveIndex(to);
  };

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/content/hero-slides", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slides),
      });
      if (res.ok) show("¡Guardado!");
      else show("Error al guardar");
    } catch {
      show("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (checking || loading) return <AdminPageSkeleton />;

  return (
    <>
      <Head>
        <title>Hero Carrusel — Admin Rivera</title>
      </Head>
      {ToastComponent}
      <PageHeader
        title="Hero — Carrusel"
        subtitle="Administra las diapositivas del hero principal"
      />

      {/* Slide tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            className={`px-4 py-2 text-sm font-medium rounded border transition-colors ${
              i === activeIndex
                ? "bg-foreground text-background border-foreground"
                : "bg-background text-foreground border-foreground/20 hover:border-foreground/40"
            }`}
          >
            Slide {i + 1}
          </button>
        ))}
        <button
          onClick={addSlide}
          className="px-4 py-2 text-sm font-medium rounded border border-dashed border-foreground/30 text-foreground/60 hover:border-foreground/60 hover:text-foreground transition-colors"
        >
          + Añadir slide
        </button>
      </div>

      {currentSlide && (
        <FormCard>
          {/* Slide controls */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-sm font-semibold text-foreground/60">
              Slide {activeIndex + 1} de {slides.length}
            </span>
            <div className="flex gap-2">
              <button
                disabled={activeIndex === 0}
                onClick={() => moveSlide(activeIndex, activeIndex - 1)}
                className="px-3 py-1.5 text-xs border rounded disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                ← Mover
              </button>
              <button
                disabled={activeIndex === slides.length - 1}
                onClick={() => moveSlide(activeIndex, activeIndex + 1)}
                className="px-3 py-1.5 text-xs border rounded disabled:opacity-30 hover:bg-foreground/5 transition-colors"
              >
                Mover →
              </button>
              {slides.length > 1 && (
                <button
                  onClick={() => removeSlide(activeIndex)}
                  className="px-3 py-1.5 text-xs border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                >
                  Eliminar
                </button>
              )}
            </div>
          </div>

          {/* Text alignment */}
          <Field label="Posición del texto">
            <div className="flex gap-3">
              {(
                [
                  { value: "left", label: "◀ Izquierda" },
                  { value: "center", label: "◉ Centro" },
                  { value: "right", label: "Derecha ▶" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateSlide("textAlign", value)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded border transition-colors ${
                    (currentSlide.textAlign ?? "left") === value
                      ? "bg-foreground text-background border-foreground"
                      : "border-foreground/20 hover:border-foreground/40"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Subtítulo (texto pequeño sobre el título)">
            <AdminInput
              value={currentSlide.subtitle}
              onChange={(v) => updateSlide("subtitle", v)}
            />
          </Field>
          <Field label="Título — Línea 1">
            <AdminInput
              value={currentSlide.titleLine1}
              onChange={(v) => updateSlide("titleLine1", v)}
            />
          </Field>
          <Field label="Título — Línea 2 (color cobre)">
            <AdminInput
              value={currentSlide.titleLine2}
              onChange={(v) => updateSlide("titleLine2", v)}
            />
          </Field>
          <Field label="Descripción">
            <AdminTextarea
              value={currentSlide.description}
              onChange={(v) => updateSlide("description", v)}
            />
          </Field>
          <Field label="Imagen de fondo">
            <ImageUploadField
              value={currentSlide.imageUrl}
              onChange={(v) => updateSlide("imageUrl", v)}
              aspect="landscape"
              placeholder="/uploads/slide.webp"
            />
          </Field>

          <SaveButton saving={saving} onClick={save} label="Guardar todos los slides" />
        </FormCard>
      )}
    </>
  );
}
