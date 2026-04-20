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
import type { ICarouselItem } from "@/domain/types";

const EMPTY_ITEM: Omit<ICarouselItem, "id"> = {
  image: "",
  title: "",
  description: "",
  order: 0,
};

export default function AdminCarouselPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [items, setItems] = useState<ICarouselItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/content/carousel-items")
      .then((r) => r.json())
      .then((data: ICarouselItem[]) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = items[activeIndex];

  const updateCurrent = (field: keyof Omit<ICarouselItem, "id">, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === activeIndex ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    const newItem: ICarouselItem = { id: 0, ...EMPTY_ITEM, order: items.length };
    setItems((prev) => [...prev, newItem]);
    setActiveIndex(items.length);
  };

  const removeItem = async (index: number) => {
    const item = items[index];
    if (!item) return;

    if (item.id > 0) {
      setDeletingId(item.id);
      try {
        const res = await fetch(`/api/content/carousel-items/${item.id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Error al eliminar");
        show("Tarjeta eliminada");
      } catch {
        show("Error al eliminar");
        setDeletingId(null);
        return;
      }
      setDeletingId(null);
    }

    const next = items.filter((_, i) => i !== index);
    setItems(next);
    setActiveIndex(Math.min(activeIndex, Math.max(0, next.length - 1)));
  };

  const moveItem = (from: number, to: number) => {
    const next = [...items];
    [next[from], next[to]] = [next[to], next[from]];
    setItems(next);
    setActiveIndex(to);
  };

  async function saveItem() {
    if (!current) return;
    if (!current.title.trim() || !current.image.trim()) {
      show("El título y la imagen son obligatorios");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        image: current.image,
        title: current.title,
        description: current.description,
        order: activeIndex,
      };

      let res: Response;
      if (current.id > 0) {
        res = await fetch(`/api/content/carousel-items/${current.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/content/carousel-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) throw new Error("Error al guardar");
      const saved = await res.json() as ICarouselItem;
      setItems((prev) => prev.map((item, i) => (i === activeIndex ? saved : item)));
      show("Tarjeta guardada");
    } catch {
      show("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  async function saveAllOrders() {
    const withIds = items.filter((i) => i.id > 0);
    if (withIds.length === 0) return;
    try {
      await Promise.all(
        withIds.map((item, idx) =>
          fetch(`/api/content/carousel-items/${item.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: idx }),
          })
        )
      );
      show("Orden guardado");
    } catch {
      show("Error al guardar el orden");
    }
  }

  if (checking || loading) return <AdminPageSkeleton />;

  return (
    <>
      <Head>
        <title>Carrusel de Materiales — Admin</title>
      </Head>
      {ToastComponent}

      <PageHeader
        title="Carrusel de Materiales"
        subtitle="Administra las tarjetas del carrusel. Al pasar el mouse se muestra el título y la descripción."
      />

      <div className="flex gap-6 flex-col lg:flex-row">
        {/* Sidebar: list of cards */}
        <div className="lg:w-72 flex-shrink-0">
          <FormCard>
            <p className="text-sm font-semibold text-foreground mb-3">Tarjetas</p>
            <div className="flex flex-col gap-1 mb-3">
              {items.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">Sin tarjetas. Agrega una.</p>
              )}
              {items.map((item, i) => (
                <div
                  key={item.id || `new-${i}`}
                  className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                    i === activeIndex ? "bg-muted font-semibold" : ""
                  }`}
                  onClick={() => setActiveIndex(i)}
                >
                  <span className="text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                  <span className="flex-1 text-sm truncate">{item.title || "Sin título"}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={i === 0}
                      onClick={(e) => { e.stopPropagation(); moveItem(i, i - 1); }}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs px-1"
                      title="Mover arriba"
                    >↑</button>
                    <button
                      type="button"
                      disabled={i === items.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveItem(i, i + 1); }}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 text-xs px-1"
                      title="Mover abajo"
                    >↓</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 flex-col">
              <button
                type="button"
                onClick={addItem}
                className="w-full py-2 border border-dashed border-border rounded text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground transition-colors"
              >
                + Agregar tarjeta
              </button>
              {items.some((i) => i.id > 0) && (
                <button
                  type="button"
                  onClick={() => void saveAllOrders()}
                  className="w-full py-1.5 text-xs text-muted-foreground border border-border rounded hover:bg-muted transition-colors"
                >
                  Guardar orden
                </button>
              )}
            </div>
          </FormCard>
        </div>

        {/* Main: edit current card */}
        <div className="flex-1">
          {current ? (
            <FormCard>
              <p className="text-sm font-semibold text-foreground mb-4">
                Tarjeta {activeIndex + 1}: {current.title || "Nueva"}
              </p>
              <div className="flex flex-col gap-4">
                <Field label="Imagen">
                  <ImageUploadField
                    value={current.image}
                    onChange={(url) => updateCurrent("image", url)}
                    label="Imagen de la tarjeta"
                  />
                </Field>

                <Field label="Título">
                  <AdminInput
                    value={current.title}
                    onChange={(v) => updateCurrent("title", v)}
                    placeholder="Ej. Pisos de Madera"
                  />
                </Field>

                <Field label="Descripción (aparece en hover)">
                  <AdminTextarea
                    value={current.description}
                    onChange={(v) => updateCurrent("description", v)}
                    placeholder="Descripción breve del material o categoría..."
                    rows={3}
                  />
                </Field>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => void removeItem(activeIndex)}
                    disabled={deletingId !== null}
                    className="text-sm text-destructive hover:underline disabled:opacity-50"
                  >
                    {deletingId !== null ? "Eliminando..." : "Eliminar tarjeta"}
                  </button>
                  <SaveButton onClick={() => void saveItem()} saving={saving} />
                </div>
              </div>
            </FormCard>
          ) : (
            <FormCard>
              <p className="text-sm text-muted-foreground">
                Agrega una tarjeta en el panel izquierdo para comenzar.
              </p>
            </FormCard>
          )}
        </div>
      </div>
    </>
  );
}
