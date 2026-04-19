"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronUp, ChevronDown, Trash2, Eye, EyeOff, Plus, GripVertical } from "lucide-react";
import { BLOCK_TYPES, type BlockType } from "@/domain/schemas/paginaBloque.schema";
import { ImageUploadField } from "@/components/admin/forms/ImageUploadField";

const WysiwygEditor = dynamic(() => import("@/components/admin/WysiwygEditor"), { ssr: false });

export interface EditorBlock {
  id?: number;
  order: number;
  type: BlockType;
  config: Record<string, unknown>;
  visible: boolean;
}

const BLOCK_LABELS: Record<BlockType, string> = {
  HERO: "Hero / Banner",
  TEXT: "Texto libre",
  TEXT_IMAGE: "Texto + Imagen",
  GALLERY: "Galería",
  QUOTE: "Cita",
  CTA: "Llamada a acción",
  SPACER: "Espaciador",
  VIDEO: "Video",
};

const DEFAULT_CONFIGS: Record<BlockType, Record<string, unknown>> = {
  HERO: { imageUrl: "", title: "", subtitle: "", height: "md" },
  TEXT: { html: "" },
  TEXT_IMAGE: { imageUrl: "", imageSide: "left", title: "", html: "" },
  GALLERY: { images: [""], columns: 3 },
  QUOTE: { text: "", author: "", role: "" },
  CTA: { title: "", buttonText: "", linkType: "external", linkHref: "", style: "primary" },
  SPACER: { size: "md" },
  VIDEO: { url: "", caption: "" },
};

interface BlockEditorProps {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
}

export default function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(blocks.length > 0 ? 0 : null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  function updateBlock(index: number, patch: Partial<EditorBlock>) {
    const updated = blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    onChange(updated);
  }

  function updateConfig(index: number, key: string, value: unknown) {
    const block = blocks[index];
    const newConfig = { ...block.config, [key]: value };
    updateBlock(index, { config: newConfig });
  }

  function moveBlock(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const arr = [...blocks];
    [arr[index], arr[target]] = [arr[target], arr[index]];
    arr.forEach((b, i) => (b.order = i));
    onChange(arr);
    setExpandedIndex(target);
  }

  function addBlock(type: BlockType) {
    const newBlock: EditorBlock = {
      order: blocks.length,
      type,
      config: { ...DEFAULT_CONFIGS[type] },
      visible: true,
    };
    const updated = [...blocks, newBlock];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
    setShowAddMenu(false);
  }

  function removeBlock(index: number) {
    if (!confirm("¿Eliminar este bloque?")) return;
    const updated = blocks.filter((_, i) => i !== index).map((b, i) => ({ ...b, order: i }));
    onChange(updated);
    setExpandedIndex(null);
  }

  function renderConfigForm(block: EditorBlock, index: number) {
    const c = block.config;
    const set = (key: string, val: unknown) => updateConfig(index, key, val);

    switch (block.type) {
      case "HERO":
        return (
          <div className="space-y-3">
            <ImageUploadField label="Imagen" value={String(c.imageUrl ?? "")} onChange={(url) => set("imageUrl", url)} aspect="landscape" />
            <label className="block text-sm font-medium">Título<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></label>
            <label className="block text-sm font-medium">Subtítulo<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.subtitle ?? "")} onChange={(e) => set("subtitle", e.target.value)} /></label>
            <label className="block text-sm font-medium">Altura
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.height ?? "md")} onChange={(e) => set("height", e.target.value)}>
                <option value="sm">Pequeño</option><option value="md">Mediano</option><option value="lg">Grande</option>
              </select>
            </label>
          </div>
        );

      case "TEXT":
        return <WysiwygEditor value={String(c.html ?? "")} onChange={(html) => set("html", html)} />;

      case "TEXT_IMAGE":
        return (
          <div className="space-y-3">
            <ImageUploadField label="Imagen" value={String(c.imageUrl ?? "")} onChange={(url) => set("imageUrl", url)} />
            <label className="block text-sm font-medium">Lado de la imagen
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.imageSide ?? "left")} onChange={(e) => set("imageSide", e.target.value)}>
                <option value="left">Izquierda</option><option value="right">Derecha</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Título<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></label>
            <WysiwygEditor value={String(c.html ?? "")} onChange={(html) => set("html", html)} />
          </div>
        );

      case "GALLERY": {
        const images = Array.isArray(c.images) ? (c.images as string[]) : [""];
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Columnas
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.columns ?? 3)} onChange={(e) => set("columns", Number(e.target.value))}>
                <option value={2}>2</option><option value={3}>3</option><option value={4}>4</option>
              </select>
            </label>
            {images.map((img, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <ImageUploadField label={`Imagen ${i + 1}`} value={img} onChange={(url) => { const newImgs = [...images]; newImgs[i] = url; set("images", newImgs); }} />
                </div>
                {images.length > 1 && (
                  <button type="button" onClick={() => { const newImgs = images.filter((_, j) => j !== i); set("images", newImgs); }} className="p-2 text-red-500 hover:text-red-700 mb-1"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set("images", [...images, ""])} className="text-sm text-[hsl(20,60%,45%)] hover:underline">+ Agregar imagen</button>
          </div>
        );
      }

      case "QUOTE":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Cita<textarea className="w-full mt-1 px-3 py-2 border rounded" rows={3} value={String(c.text ?? "")} onChange={(e) => set("text", e.target.value)} /></label>
            <label className="block text-sm font-medium">Autor<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.author ?? "")} onChange={(e) => set("author", e.target.value)} /></label>
            <label className="block text-sm font-medium">Rol<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.role ?? "")} onChange={(e) => set("role", e.target.value)} /></label>
          </div>
        );

      case "CTA":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Título<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></label>
            <label className="block text-sm font-medium">Texto del botón<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.buttonText ?? "")} onChange={(e) => set("buttonText", e.target.value)} /></label>
            <label className="block text-sm font-medium">Tipo de enlace
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.linkType ?? "external")} onChange={(e) => set("linkType", e.target.value)}>
                <option value="internal">Interno</option><option value="external">Externo</option>
              </select>
            </label>
            <label className="block text-sm font-medium">URL del enlace<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.linkHref ?? "")} onChange={(e) => set("linkHref", e.target.value)} placeholder={String(c.linkType) === "internal" ? "/p/nosotros" : "https://..."} /></label>
            <label className="block text-sm font-medium">Estilo
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.style ?? "primary")} onChange={(e) => set("style", e.target.value)}>
                <option value="primary">Primario</option><option value="secondary">Secundario</option>
              </select>
            </label>
          </div>
        );

      case "SPACER":
        return (
          <label className="block text-sm font-medium">Tamaño
            <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.size ?? "md")} onChange={(e) => set("size", e.target.value)}>
              <option value="sm">Pequeño</option><option value="md">Mediano</option><option value="lg">Grande</option>
            </select>
          </label>
        );

      case "VIDEO":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">URL del video (YouTube, Vimeo)<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.url ?? "")} onChange={(e) => set("url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." /></label>
            <label className="block text-sm font-medium">Pie de foto<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.caption ?? "")} onChange={(e) => set("caption", e.target.value)} /></label>
          </div>
        );
    }
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={index} className="border rounded-lg bg-white overflow-hidden">
          {/* Block header */}
          <div
            className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer select-none"
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
          >
            <GripVertical size={14} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-500 bg-gray-200 rounded px-2 py-0.5">{block.type}</span>
            <span className="text-sm font-medium flex-1">{BLOCK_LABELS[block.type]}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); updateBlock(index, { visible: !block.visible }); }} className="p-1 text-gray-400 hover:text-gray-600" title={block.visible ? "Ocultar" : "Mostrar"}>
              {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveBlock(index, -1); }} disabled={index === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronUp size={14} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); moveBlock(index, 1); }} disabled={index === blocks.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"><ChevronDown size={14} /></button>
            <button type="button" onClick={(e) => { e.stopPropagation(); removeBlock(index); }} className="p-1 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
          </div>
          {/* Block config form */}
          {expandedIndex === index && (
            <div className="p-4 border-t">
              {renderConfigForm(block, index)}
            </div>
          )}
        </div>
      ))}

      {/* Add block button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,45%)] w-full justify-center"
        >
          <Plus size={16} /> Agregar bloque
        </button>
        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 grid grid-cols-2 gap-1 p-2">
            {BLOCK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => addBlock(type)}
                className="text-left px-3 py-2 text-sm rounded hover:bg-gray-100"
              >
                {BLOCK_LABELS[type]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
