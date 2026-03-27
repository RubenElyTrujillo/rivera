import { useState, useEffect } from "react";
import Head from "next/head";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  useAdminAuth, PageHeader, FormCard, Field,
  AdminInput, SaveButton, useToast,
} from "@/components/admin/adminUtils";
import { Trash2, Plus } from "lucide-react";
import type { IContactInfo } from "@/interfaces";

const DEFAULTS: IContactInfo = {
  whatsappPhone: "525629671869",
  phone1: "+52 56 29 67 18 69",
  phone2: "+52 55 79 16 78 44",
  email: "jorgeri_1990@hotmail.com",
  hoursText: "Lunes a Viernes\n9:00 AM — 10:00 PM",
  surfaceOptions: [
    "Piso de Madera de Ingeniería",
    "Piso Laminado",
    "Piso Vinílico SPC",
    "Deck Sintético",
    "Lambrines / Muros",
    "Persianas / Cortinas",
    "Restauración / Pulido",
    "Molduras",
    "Otro",
  ],
};

export default function AdminContactPage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [data, setData] = useState<IContactInfo>(DEFAULTS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/contact")
      .then((r) => r.json())
      .then((d: IContactInfo | null) => {
        if (d) setData(d);
      });
  }, []);

  const set = (key: keyof IContactInfo) => (v: string) =>
    setData((prev) => ({ ...prev, [key]: v }));

  const updateOption = (idx: number, v: string) =>
    setData((prev) => ({
      ...prev,
      surfaceOptions: prev.surfaceOptions.map((o, i) => (i === idx ? v : o)),
    }));

  const removeOption = (idx: number) =>
    setData((prev) => ({
      ...prev,
      surfaceOptions: prev.surfaceOptions.filter((_, i) => i !== idx),
    }));

  const addOption = () =>
    setData((prev) => ({ ...prev, surfaceOptions: [...prev.surfaceOptions, ""] }));

  async function save() {
    setSaving(true);
    await fetch("/api/content/contact", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    show("¡Guardado!");
  }

  if (checking) return null;

  return (
    <>
      <Head><title>Contacto — Admin Rivera</title></Head>
      <AdminLayout>
        <PageHeader title="Información de Contacto" subtitle="Datos de contacto y opciones del formulario de cotización" />
        <FormCard>
          <Field label="WhatsApp (número limpio, solo dígitos)" hint="Ej: 525629671869">
            <AdminInput value={data.whatsappPhone} onChange={set("whatsappPhone")} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Teléfono 1 (visible)">
              <AdminInput value={data.phone1} onChange={set("phone1")} />
            </Field>
            <Field label="Teléfono 2 (visible)">
              <AdminInput value={data.phone2} onChange={set("phone2")} />
            </Field>
          </div>
          <Field label="Email">
            <AdminInput value={data.email} onChange={set("email")} type="email" />
          </Field>
          <Field label="Horario (texto libre)">
            <textarea
              value={data.hoursText}
              onChange={(e) => set("hoursText")(e.target.value)}
              rows={2}
              className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] resize-none"
            />
          </Field>
        </FormCard>

        <div className="mt-6">
          <h2 className="text-sm font-bold mb-3 text-[hsl(0,0%,13%)]">
            Opciones del formulario (Tipo de superficie)
          </h2>
          <div className="space-y-2">
            {data.surfaceOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2">
                <AdminInput value={opt} onChange={(v) => updateOption(idx, v)} />
                <button onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-600">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button onClick={addOption} className="flex items-center gap-2 text-sm font-semibold text-[hsl(20,60%,45%)]">
              <Plus size={16} /> Agregar opción
            </button>
          </div>
        </div>

        <div className="mt-6">
          <SaveButton saving={saving} onClick={save} />
        </div>
      </AdminLayout>
      {ToastComponent}
    </>
  );
}
