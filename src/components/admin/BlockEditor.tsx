"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ChevronUp, ChevronDown, Trash2, Eye, EyeOff, Plus, ChevronRight,
  Image as ImageIcon, Type, LayoutTemplate, Grid2x2, Quote,
  MousePointerClick, Minus, Video, X,
} from "lucide-react";
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
  GALLERY: "Galería de imágenes",
  QUOTE: "Cita destacada",
  CTA: "Botón de acción",
  SPACER: "Espacio en blanco",
  VIDEO: "Video",
};

const BLOCK_DESCRIPTIONS: Record<BlockType, string> = {
  HERO: "Imagen grande con título encima, ideal para portadas",
  TEXT: "Párrafos, listas y texto con formato",
  TEXT_IMAGE: "Texto al lado de una imagen",
  GALLERY: "Cuadrícula de fotos",
  QUOTE: "Frase destacada con autor",
  CTA: "Botón grande que lleva a otra página",
  SPACER: "Separación vertical entre secciones",
  VIDEO: "Video de YouTube o Vimeo",
};

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  HERO: ImageIcon,
  TEXT: Type,
  TEXT_IMAGE: LayoutTemplate,
  GALLERY: Grid2x2,
  QUOTE: Quote,
  CTA: MousePointerClick,
  SPACER: Minus,
  VIDEO: Video,
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
            <ImageUploadField label="Imagen de fondo" value={String(c.imageUrl ?? "")} onChange={(url) => set("imageUrl", url)} aspect="landscape" />
            <label className="block text-sm font-medium">Título principal<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder="Ej: Bienvenidos a Rivera" /></label>
            <label className="block text-sm font-medium">Subtítulo <span className="font-normal text-gray-400">(opcional)</span><input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.subtitle ?? "")} onChange={(e) => set("subtitle", e.target.value)} placeholder="Ej: Especialistas en pisos y acabados" /></label>
            <label className="block text-sm font-medium">Altura de la imagen
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.height ?? "md")} onChange={(e) => set("height", e.target.value)}>
                <option value="sm">Pequeño (300px)</option>
                <option value="md">Mediano (500px)</option>
                <option value="lg">Grande (pantalla completa)</option>
              </select>
            </label>
          </div>
        );

      case "TEXT":
        return (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Usa la barra de herramientas para dar formato al texto: negritas, listas, encabezados, etc.</p>
            <WysiwygEditor value={String(c.html ?? "")} onChange={(html) => set("html", html)} />
          </div>
        );

      case "TEXT_IMAGE":
        return (
          <div className="space-y-3">
            <ImageUploadField label="Imagen" value={String(c.imageUrl ?? "")} onChange={(url) => set("imageUrl", url)} />
            <label className="block text-sm font-medium">¿La imagen va a la izquierda o derecha del texto?
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.imageSide ?? "left")} onChange={(e) => set("imageSide", e.target.value)}>
                <option value="left">Imagen a la izquierda</option>
                <option value="right">Imagen a la derecha</option>
              </select>
            </label>
            <label className="block text-sm font-medium">Título <span className="font-normal text-gray-400">(opcional)</span><input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} /></label>
            <div className="space-y-1">
              <p className="text-sm font-medium">Texto</p>
              <WysiwygEditor value={String(c.html ?? "")} onChange={(html) => set("html", html)} />
            </div>
          </div>
        );

      case "GALLERY": {
        const images = Array.isArray(c.images) ? (c.images as string[]) : [""];
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">¿Cuántas fotos por fila?
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.columns ?? 3)} onChange={(e) => set("columns", Number(e.target.value))}>
                <option value={2}>2 fotos por fila</option>
                <option value={3}>3 fotos por fila</option>
                <option value={4}>4 fotos por fila</option>
              </select>
            </label>
            <p className="text-sm font-medium">Fotos <span className="font-normal text-gray-400">({images.length} agregada{images.length !== 1 ? "s" : ""})</span></p>
            {images.map((img, i) => (
              <div key={i} className="flex gap-2 items-end">
                <div className="flex-1">
                  <ImageUploadField label={`Foto ${i + 1}`} value={img} onChange={(url) => { const newImgs = [...images]; newImgs[i] = url; set("images", newImgs); }} />
                </div>
                {images.length > 1 && (
                  <button type="button" onClick={() => { const newImgs = images.filter((_, j) => j !== i); set("images", newImgs); }} className="p-2 text-red-500 hover:text-red-700 mb-1" title="Quitar foto"><Trash2 size={16} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => set("images", [...images, ""])} className="flex items-center gap-1 text-sm text-[hsl(20,60%,45%)] hover:underline"><Plus size={14} /> Agregar otra foto</button>
          </div>
        );
      }

      case "QUOTE":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Frase o cita<textarea className="w-full mt-1 px-3 py-2 border rounded" rows={3} value={String(c.text ?? "")} onChange={(e) => set("text", e.target.value)} placeholder="Ej: La calidad no es un accidente, es siempre el resultado de un esfuerzo inteligente." /></label>
            <label className="block text-sm font-medium">Autor <span className="font-normal text-gray-400">(opcional)</span><input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.author ?? "")} onChange={(e) => set("author", e.target.value)} placeholder="Ej: John Ruskin" /></label>
            <label className="block text-sm font-medium">Cargo o empresa <span className="font-normal text-gray-400">(opcional)</span><input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.role ?? "")} onChange={(e) => set("role", e.target.value)} placeholder="Ej: Director de Rivera" /></label>
          </div>
        );

      case "CTA":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Título o mensaje<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.title ?? "")} onChange={(e) => set("title", e.target.value)} placeholder="Ej: ¿Listo para transformar tus espacios?" /></label>
            <label className="block text-sm font-medium">Texto del botón<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.buttonText ?? "")} onChange={(e) => set("buttonText", e.target.value)} placeholder="Ej: Contáctanos ahora" /></label>
            <label className="block text-sm font-medium">¿A dónde lleva el botón?
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.linkType ?? "external")} onChange={(e) => set("linkType", e.target.value)}>
                <option value="internal">Otra página de este sitio</option>
                <option value="external">Sitio externo (otro URL)</option>
              </select>
            </label>
            <label className="block text-sm font-medium">URL del destino<input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.linkHref ?? "")} onChange={(e) => set("linkHref", e.target.value)} placeholder={String(c.linkType) === "internal" ? "/p/nosotros" : "https://wa.me/..."} /></label>
            <label className="block text-sm font-medium">Estilo del botón
              <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.style ?? "primary")} onChange={(e) => set("style", e.target.value)}>
                <option value="primary">Principal (fondo oscuro)</option>
                <option value="secondary">Secundario (solo borde)</option>
              </select>
            </label>
          </div>
        );

      case "SPACER":
        return (
          <label className="block text-sm font-medium">¿Cuánto espacio?
            <select className="w-full mt-1 px-3 py-2 border rounded" value={String(c.size ?? "md")} onChange={(e) => set("size", e.target.value)}>
              <option value="sm">Pequeño (32px)</option>
              <option value="md">Mediano (64px)</option>
              <option value="lg">Grande (128px)</option>
            </select>
          </label>
        );

      case "VIDEO":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium">
              Enlace del video
              <input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.url ?? "")} onChange={(e) => set("url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              <p className="text-xs text-gray-400 mt-1">Funciona con YouTube y Vimeo. Pega el enlace normal del video.</p>
            </label>
            <label className="block text-sm font-medium">Descripción debajo del video <span className="font-normal text-gray-400">(opcional)</span><input className="w-full mt-1 px-3 py-2 border rounded" value={String(c.caption ?? "")} onChange={(e) => set("caption", e.target.value)} /></label>
          </div>
        );
    }
  }

  return (
    <div className="space-y-2">
      {blocks.length === 0 && (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
          <p className="text-sm">Aún no hay bloques.</p>
          <p className="text-xs mt-1">Agrega el primero con el botón de abajo.</p>
        </div>
      )}

      {blocks.map((block, index) => {
        const BlockIcon = BLOCK_ICONS[block.type];
        const isExpanded = expandedIndex === index;
        return (
          <div key={index} className={`border rounded-lg bg-white overflow-hidden transition-shadow ${isExpanded ? "shadow-md border-[hsl(20,60%,45%)]" : "hover:shadow-sm"}`}>
            {/* Block header */}
            <div
              className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
            >
              {/* Position number */}
              <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </span>
              {/* Block type icon */}
              <BlockIcon size={15} className={isExpanded ? "text-[hsl(20,60%,45%)]" : "text-gray-400"} />
              {/* Label */}
              <span className="text-sm font-medium flex-1 text-gray-700">{BLOCK_LABELS[block.type]}</span>
              {/* Hidden badge */}
              {!block.visible && (
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Oculto</span>
              )}
              {/* Actions */}
              <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => updateBlock(index, { visible: !block.visible })}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  title={block.visible ? "Ocultar en la página" : "Mostrar en la página"}
                >
                  {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, -1)}
                  disabled={index === 0}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed"
                  title="Mover arriba"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                  className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-25 disabled:cursor-not-allowed"
                  title="Mover abajo"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                  title="Eliminar bloque"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {/* Expand chevron */}
              <ChevronRight
                size={14}
                className={`text-gray-300 transition-transform flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
              />
            </div>

            {/* Block config form */}
            {isExpanded && (
              <div className="p-4 border-t bg-gray-50">
                {renderConfigForm(block, index)}
              </div>
            )}
          </div>
        );
      })}

      {/* Add block button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,45%)] w-full justify-center transition-colors"
        >
          <Plus size={16} /> Agregar bloque de contenido
        </button>

        {showAddMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-10" onClick={() => setShowAddMenu(false)} />
            {/* Menu */}
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border rounded-xl shadow-xl z-20 p-3">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Elige un tipo de bloque</p>
                <button type="button" onClick={() => setShowAddMenu(false)} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {BLOCK_TYPES.map((type) => {
                  const Icon = BLOCK_ICONS[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addBlock(type)}
                      className="flex items-start gap-3 p-3 rounded-lg text-left hover:bg-[hsl(20,60%,45%)]/5 hover:border-[hsl(20,60%,45%)] border border-transparent transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={15} className="text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{BLOCK_LABELS[type]}</p>
                        <p className="text-xs text-gray-400 leading-snug mt-0.5">{BLOCK_DESCRIPTIONS[type]}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
