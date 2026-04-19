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
import { Trash2, Plus, GripVertical } from "lucide-react";
import type { IService } from "@/domain/types";
import LinkPicker, { type LinkValue, serializeLinkValue, deserializeLinkValue } from "@/components/admin/LinkPicker";

const ICON_OPTIONS = [
  "Layers", "Wrench", "Palette", "Columns3", "Zap",
  "Hammer", "Star", "Home", "Package", "Shield",
];

const DEFAULT_SERVICES: IService[] = [
  { id: 1, icon: "Layers", title: "PISOS Y RECUBRIMIENTOS", subtitle: "Venta e instalación profesional", desc: "Madera sólida, ingeniería, laminados, vinílicos SPC y deck sintético para interiores y exteriores.", order: 0, linkType: "none", linkHref: null },
  { id: 2, icon: "Wrench", title: "RESTAURACIÓN", subtitle: "Madera, granito, mármol y decks", desc: "Recuperamos la vida de sus superficies existentes. Pulido, lijado, barnizado y mantenimiento profesional.", order: 1, linkType: "none", linkHref: null },
  { id: 3, icon: "Palette", title: "DECORACIÓN", subtitle: "Persianas, follaje y tapices", desc: "Soluciones decorativas que aportan confort, privacidad y naturaleza a sus espacios.", order: 2, linkType: "none", linkHref: null },
  { id: 4, icon: "Columns3", title: "MOLDURAS Y ACABADOS", subtitle: "MDF y madera sólida", desc: "Fabricamos la moldura exacta que tu proyecto necesita. Personalización total en medidas y colores.", order: 3, linkType: "none", linkHref: null },
  { id: 5, icon: "Zap", title: "TECNOLOGÍA Y CONFORT", subtitle: "Repisas y puertos ocultos", desc: "Integramos tecnología en tu mobiliario: multicontactos empotrados, consolas traseras y más.", order: 4, linkType: "none", linkHref: null },
];

export default function AdminServicesPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [services, setServices] = useState<IService[]>(DEFAULT_SERVICES);
  const [saving, setSaving] = useState(false);
  const [linkValues, setLinkValues] = useState<Record<number, LinkValue>>(() => {
    const lv: Record<number, LinkValue> = {};
    DEFAULT_SERVICES.forEach((s) => { lv[s.id] = deserializeLinkValue(s.linkType, s.linkHref); });
    return lv;
  });

  useEffect(() => {
    fetch("/api/content/services")
      .then((r) => r.json())
      .then((d: IService[] | null) => {
        if (d && d.length > 0) {
          setServices(d);
          const lv: Record<number, LinkValue> = {};
          d.forEach((s) => { lv[s.id] = deserializeLinkValue(s.linkType, s.linkHref); });
          setLinkValues(lv);
        }
      });
  }, []);

  const update = (idx: number, key: keyof IService, value: string | number) => {
    setServices((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [key]: value } : s))
    );
  };

  const remove = (idx: number) => setServices((prev) => prev.filter((_, i) => i !== idx));

  const add = () => {
    const newId = Date.now();
    setServices((prev) => [
      ...prev,
      { id: newId, icon: "Star", title: "", subtitle: "", desc: "", order: prev.length, linkType: "none", linkHref: null },
    ]);
    setLinkValues((prev) => ({ ...prev, [newId]: { type: "none" } }));
  };

  async function save() {
    setSaving(true);
    const payload = services.map((s, i) => ({ ...s, order: i }));
    await fetch("/api/content/services", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Servicios — Admin Rivera</title></Head>
        <PageHeader title="Servicios" subtitle="Tarjetas de servicios en la segunda sección" />
        <div className="space-y-4">
          {services.map((service, idx) => (
            <FormCard key={service.id}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-[hsl(0,0%,50%)]">
                  <GripVertical size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Servicio {idx + 1}</span>
                </div>
                <button
                  onClick={() => remove(idx)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Título">
                  <AdminInput value={service.title} onChange={(v) => update(idx, "title", v)} />
                </Field>
                <Field label="Ícono">
                  <select
                    value={service.icon}
                    onChange={(e) => update(idx, "icon", e.target.value)}
                    className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)]"
                  >
                    {ICON_OPTIONS.map((ico) => (
                      <option key={ico} value={ico}>{ico}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Subtítulo">
                <AdminInput value={service.subtitle} onChange={(v) => update(idx, "subtitle", v)} />
              </Field>
              <Field label="Descripción">
                <AdminTextarea value={service.desc} onChange={(v) => update(idx, "desc", v)} rows={2} />
              </Field>
              <Field label="Enlace al hacer clic">
                <LinkPicker
                  value={linkValues[service.id] ?? { type: "none" }}
                  onChange={(v) => {
                    setLinkValues((prev) => ({ ...prev, [service.id]: v }));
                    const { linkType, linkHref } = serializeLinkValue(v);
                    update(idx, "linkType", linkType);
                    update(idx, "linkHref", linkHref ?? "");
                  }}
                />
              </Field>
            </FormCard>
          ))}

          <button
            onClick={add}
            className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)] hover:text-[hsl(20,60%,35%)] transition-colors"
          >
            <Plus size={16} />
            Agregar servicio
          </button>

          <SaveButton saving={saving} onClick={save} />
        </div>
      {ToastComponent}
    </>
  );
}
