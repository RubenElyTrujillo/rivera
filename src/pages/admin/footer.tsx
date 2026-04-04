import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, SaveButton, useToast,
} from "@/components/admin/adminUtils";
import { Trash2, Plus } from "lucide-react";
import type { IFooterContent } from "@/interfaces";

const DEFAULTS: IFooterContent = {
  tagline: "Soluciones integrales en acabados y decoración de interiores.",
  services: [
    "Pisos y Recubrimientos",
    "Mantenimiento y Restauración",
    "Decoración y Complementos",
    "Molduras y Acabados",
    "Tecnología y Confort",
    "Persianas y Cortinas",
  ],
};

export default function AdminFooterPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [data, setData] = useState<IFooterContent>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/footer")
      .then((r) => r.json())
      .then((d: IFooterContent | null) => {
        if (d) setData(d);
      });
  }, []);

  const updateService = (idx: number, v: string) =>
    setData((prev) => ({
      ...prev,
      services: prev.services.map((s, i) => (i === idx ? v : s)),
    }));

  const removeService = (idx: number) =>
    setData((prev) => ({ ...prev, services: prev.services.filter((_, i) => i !== idx) }));

  const addService = () =>
    setData((prev) => ({ ...prev, services: [...prev.services, ""] }));

  async function save() {
    setSaving(true);
    await fetch("/api/content/footer", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return <div className="p-8 text-foreground/30 text-sm">Cargando…</div>;

  return (
    <>
      <Head><title>Footer — Admin Rivera</title></Head>
        <PageHeader title="Footer" subtitle="Tagline y lista de servicios en el pie de página" />
        <FormCard>
          <Field label="Tagline (descripción breve de la empresa)">
            <AdminInput
              value={data.tagline}
              onChange={(v) => setData((p) => ({ ...p, tagline: v }))}
            />
          </Field>
        </FormCard>

        <div className="mt-6">
          <h2 className="text-sm font-bold mb-3 text-[hsl(0,0%,13%)]">Lista de servicios</h2>
          <div className="space-y-2">
            {data.services.map((svc, idx) => (
              <div key={idx} className="flex gap-2">
                <AdminInput value={svc} onChange={(v) => updateService(idx, v)} />
                <button onClick={() => removeService(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addService} className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)]">
              <Plus size={16} /> Agregar servicio
            </button>
          </div>
        </div>

        <div className="mt-6">
          <SaveButton saving={saving} onClick={save} />
        </div>
      {ToastComponent}
    </>
  );
}
