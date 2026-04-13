import Head from "next/head";
import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  useAdminAuth, PageHeader, SaveButton, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import type { IPageSection } from "@/domain/types";

const SECTION_LABELS: Record<string, string> = {
  HERO:     "Hero / Carrusel",
  SERVICES: "Ventas",
  PRODUCTS: "Materiales / Showroom",
  SPACES:   "Espacios y proyectos",
  CATALOG:  "Catálogo PDF",
  CONTACT:  "Contacto",
  FOOTER:   "Footer",
};

function SortableRow({ section, onToggle }: { section: IPageSection; onToggle: (id: number, visible: boolean) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 bg-white border border-[hsl(0,0%,88%)] rounded-lg px-4 py-3 mb-2"
    >
      <button {...attributes} {...listeners} className="cursor-grab text-[hsl(0,0%,70%)] hover:text-foreground touch-none">
        <GripVertical size={18} />
      </button>
      <div className="flex-1">
        <p className="font-semibold text-sm text-[hsl(0,0%,13%)]">
          {SECTION_LABELS[section.type] ?? section.type}
        </p>
        <p className="text-xs text-[hsl(0,0%,55%)]">Orden: {section.order}</p>
      </div>
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={section.visible}
          onChange={(e) => onToggle(section.id, e.target.checked)}
          className="w-4 h-4 accent-[hsl(20,60%,45%)]"
        />
        <span className={section.visible ? "text-green-700 font-semibold" : "text-[hsl(0,0%,55%)]"}>
          {section.visible ? "Visible" : "Oculta"}
        </span>
      </label>
    </div>
  );
}

export default function AdminPageSectionsPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [sections, setSections] = useState<IPageSection[]>([]);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetch("/api/content/page-sections")
      .then((r) => r.json())
      .then((data: IPageSection[]) => setSections([...data].sort((a, b) => a.order - b.order)))
      .catch(() => null);
  }, []);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((prev) => {
      const oldIndex = prev.findIndex((s) => s.id === active.id);
      const newIndex = prev.findIndex((s) => s.id === over.id);
      return arrayMove(prev, oldIndex, newIndex).map((s, i) => ({ ...s, order: i + 1 }));
    });
  }

  async function toggleVisible(id: number, visible: boolean) {
    setSections((prev) => prev.map((s) => s.id === id ? { ...s, visible } : s));
    try {
      const res = await fetch(`/api/content/page-sections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible }),
      });
      if (!res.ok) { show("Error al actualizar sección"); return; }
      show(visible ? "Sección visible" : "Sección oculta");
    } catch { show("Error de conexión"); }
  }

  async function saveOrder() {
    setSaving(true);
    try {
      const res = await fetch("/api/content/page-sections/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sections.map((s, i) => ({ id: s.id, order: i + 1 }))),
      });
      if (!res.ok) { show("Error al guardar orden"); return; }
      show("Orden guardado");
    } catch { show("Error de conexión"); }
    finally { setSaving(false); }
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Secciones — Admin Rivera</title></Head>
      {ToastComponent}
      <PageHeader
        title="Secciones de la página"
        subtitle="Arrastra para reordenar. El toggle muestra u oculta cada sección."
      />

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((s) => (
            <SortableRow key={s.id} section={s} onToggle={toggleVisible} />
          ))}
        </SortableContext>
      </DndContext>

      <div className="mt-6">
        <SaveButton onClick={saveOrder} saving={saving} label="Guardar orden" />
      </div>
    </>
  );
}
