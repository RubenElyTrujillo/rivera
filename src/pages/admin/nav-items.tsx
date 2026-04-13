import React, { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, useToast, AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import { Trash2, Plus, Pencil, Check, X, EyeOff } from "lucide-react";
import type { INavItem } from "@/domain/types";

type EditState = { label: string; href: string; visible: boolean; order: number };
type AddState = { label: string; href: string; visible: boolean; order: number };

const EMPTY_ADD: AddState = { label: "", href: "", visible: true, order: 0 };

function buildTree(flat: INavItem[]): INavItem[] {
  const map = new Map<number, INavItem & { children: INavItem[] }>();
  [...flat].sort((a, b) => a.order - b.order).forEach((i) => map.set(i.id, { ...i, children: [] }));
  const roots: INavItem[] = [];
  map.forEach((item) => {
    if (item.parentId === null) {
      roots.push(item);
    } else {
      map.get(item.parentId)?.children?.push(item);
    }
  });
  return roots;
}

interface NavRowProps {
  item: INavItem;
  editing: EditState | null;
  saving: boolean;
  depth: number;
  canAddChild: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: () => void;
  onChange: (k: keyof EditState, v: string | boolean | number) => void;
  onAddChild: () => void;
}

function NavRow({
  item, editing, saving, depth, canAddChild,
  onEdit, onCancel, onSave, onDelete, onChange, onAddChild,
}: NavRowProps) {
  if (editing) {
    return (
      <div className="rounded border border-[hsl(20,60%,45%)]/30 bg-[hsl(20,60%,45%)]/5 p-3 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Etiqueta *">
            <AdminInput
              value={editing.label}
              onChange={(v) => onChange("label", v)}
              placeholder="Pisos"
            />
          </Field>
          <Field label="URL (href)">
            <AdminInput
              value={editing.href}
              onChange={(v) => onChange("href", v)}
              placeholder="/categorias/pisos"
            />
          </Field>
          <Field label="Orden">
            <AdminInput
              value={String(editing.order)}
              onChange={(v) => onChange("order", Number(v))}
              placeholder="0"
            />
          </Field>
          <Field label="Visible en el menú">
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.visible}
                onChange={(e) => onChange("visible", e.target.checked)}
                className="w-4 h-4 accent-[hsl(20,60%,45%)]"
              />
              <span className="text-sm text-[hsl(0,0%,40%)]">
                {editing.visible ? "Visible" : "Oculto"}
              </span>
            </label>
          </Field>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-3 py-1.5 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
          >
            <Check size={12} />
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs font-semibold border border-[hsl(0,0%,80%)] text-[hsl(0,0%,40%)] px-3 py-1.5 rounded hover:bg-[hsl(0,0%,95%)] transition-colors"
          >
            <X size={12} /> Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded border border-[hsl(0,0%,90%)] bg-[hsl(0,0%,97%)]">
      <span
        className={`flex-1 text-sm truncate ${
          !item.visible ? "text-[hsl(0,0%,60%)] line-through" : "text-[hsl(0,0%,13%)] font-medium"
        }`}
      >
        {item.label}
        {item.href && (
          <span className="ml-2 text-xs font-mono text-[hsl(0,0%,55%)] font-normal">
            {item.href}
          </span>
        )}
      </span>
      {!item.visible && <EyeOff size={12} className="text-[hsl(0,0%,50%)] shrink-0" />}
      {canAddChild && depth < 2 && (
        <button
          onClick={onAddChild}
          title="Agregar hijo"
          className="p-1 rounded text-[hsl(0,0%,55%)] hover:text-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,45%)]/10 transition-colors shrink-0"
        >
          <Plus size={13} />
        </button>
      )}
      <button
        onClick={onEdit}
        title="Editar"
        className="p-1 rounded text-[hsl(0,0%,55%)] hover:text-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,45%)]/10 transition-colors shrink-0"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={onDelete}
        title="Eliminar"
        className="p-1 rounded text-[hsl(0,0%,55%)] hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

interface AddFormProps {
  saving: boolean;
  onSave: (data: AddState) => void;
  onCancel: () => void;
}

function AddForm({ saving, onSave, onCancel }: AddFormProps) {
  const [form, setForm] = useState<AddState>({ ...EMPTY_ADD });

  return (
    <div className="rounded border border-[hsl(20,60%,45%)]/30 bg-[hsl(20,60%,45%)]/5 p-3 space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Etiqueta *">
          <AdminInput
            value={form.label}
            onChange={(v) => setForm((p) => ({ ...p, label: v }))}
            placeholder="Pisos Laminados"
          />
        </Field>
        <Field label="URL (href)">
          <AdminInput
            value={form.href}
            onChange={(v) => setForm((p) => ({ ...p, href: v }))}
            placeholder="/categorias/pisos-laminados"
          />
        </Field>
        <Field label="Orden">
          <AdminInput
            value={String(form.order)}
            onChange={(v) => setForm((p) => ({ ...p, order: Number(v) }))}
            placeholder="0"
          />
        </Field>
        <Field label="Visible">
          <label className="flex items-center gap-2 mt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.visible}
              onChange={(e) => setForm((p) => ({ ...p, visible: e.target.checked }))}
              className="w-4 h-4 accent-[hsl(20,60%,45%)]"
            />
            <span className="text-sm text-[hsl(0,0%,40%)]">
              {form.visible ? "Visible" : "Oculto"}
            </span>
          </label>
        </Field>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.label}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(20,60%,45%)] text-white px-3 py-1.5 rounded hover:bg-[hsl(20,60%,35%)] transition-colors disabled:opacity-50"
        >
          <Check size={12} />
          {saving ? "Agregando..." : "Agregar"}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 text-xs font-semibold border border-[hsl(0,0%,80%)] text-[hsl(0,0%,40%)] px-3 py-1.5 rounded hover:bg-[hsl(0,0%,95%)] transition-colors"
        >
          <X size={12} /> Cancelar
        </button>
      </div>
    </div>
  );
}

export default function AdminNavItemsPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [allItems, setAllItems] = useState<INavItem[]>([]);
  const [editing, setEditing] = useState<Record<number, EditState | null>>({});
  const [addingParentId, setAddingParentId] = useState<number | null | "none">("none");
  const [saving, setSaving] = useState(false);

  async function reload() {
    const data: INavItem[] = await fetch("/api/content/nav-items").then((r) => r.json());
    if (Array.isArray(data)) setAllItems(data);
  }

  useEffect(() => { reload(); }, []);

  function startEdit(item: INavItem) {
    setEditing((p) => ({
      ...p,
      [item.id]: { label: item.label, href: item.href, visible: item.visible, order: item.order },
    }));
  }

  function cancelEdit(id: number) {
    setEditing((p) => ({ ...p, [id]: null }));
  }

  async function saveEdit(item: INavItem) {
    const edits = editing[item.id];
    if (!edits) return;
    setSaving(true);
    await fetch(`/api/content/nav-items?id=${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...edits, parentId: item.parentId }),
    });
    await reload();
    setEditing((p) => ({ ...p, [item.id]: null }));
    setSaving(false);
    show("Guardado");
  }

  async function addItem(data: AddState, parentId: number | null) {
    if (!data.label) return;
    setSaving(true);
    await fetch("/api/content/nav-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, parentId }),
    });
    await reload();
    setAddingParentId("none");
    setSaving(false);
    show("Item agregado");
  }

  async function deleteItem(id: number, hasChildren: boolean) {
    const msg = hasChildren
      ? "¿Eliminar este item y todos sus hijos?"
      : "¿Eliminar este item?";
    if (!confirm(msg)) return;
    await fetch(`/api/content/nav-items?id=${id}`, { method: "DELETE" });
    await reload();
    show("Eliminado");
  }

  if (checking) return <AdminPageSkeleton />;

  const tree = buildTree(allItems);

  function renderItems(items: INavItem[], depth: number): React.ReactNode {
    return items.map((item) => {
      const hasChildren = (item.children?.length ?? 0) > 0;
      return (
        <div key={item.id}>
          <NavRow
            item={item}
            editing={editing[item.id] ?? null}
            saving={saving}
            depth={depth}
            canAddChild={addingParentId === "none" || addingParentId === item.id}
            onEdit={() => startEdit(item)}
            onCancel={() => cancelEdit(item.id)}
            onSave={() => saveEdit(item)}
            onDelete={() => deleteItem(item.id, hasChildren)}
            onChange={(k, v) =>
              setEditing((p) => ({
                ...p,
                [item.id]: p[item.id] ? { ...p[item.id]!, [k]: v } : null,
              }))
            }
            onAddChild={() => setAddingParentId(item.id)}
          />
          {addingParentId === item.id && (
            <div className="ml-6 pl-3">
              <AddForm
                saving={saving}
                onSave={(data) => addItem(data, item.id)}
                onCancel={() => setAddingParentId("none")}
              />
            </div>
          )}
          {hasChildren && (
            <div className="ml-6 border-l border-[hsl(0,0%,88%)] pl-3 mt-1 space-y-1">
              {renderItems(item.children!, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  }

  return (
    <>
      <Head><title>Navegación — Admin Rivera</title></Head>
      <PageHeader
        title="Navegación"
        subtitle="Árbol de menú de 3 niveles. Items ocultos no aparecen en el sitio. Eliminar un item también elimina sus hijos."
      />
      <FormCard>
        <div className="space-y-1">
          {renderItems(tree, 0)}
        </div>

        {addingParentId === null && (
          <AddForm
            saving={saving}
            onSave={(data) => addItem(data, null)}
            onCancel={() => setAddingParentId("none")}
          />
        )}

        <button
          onClick={() => setAddingParentId(null)}
          className="mt-4 flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)] transition-colors"
        >
          <Plus size={16} /> Agregar item raíz
        </button>
      </FormCard>
      {ToastComponent}
    </>
  );
}
