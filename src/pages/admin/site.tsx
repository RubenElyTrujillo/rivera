import { useState, useEffect } from "react";
import Head from "next/head";
import {
  useAdminAuth, PageHeader, FormCard, SaveButton, useToast,
  AdminPageSkeleton,
} from "@/components/admin/adminUtils";
import type { ISiteConfig } from "@/repositories/siteConfig.repository";

/** Componente de toggle on/off para una sección del sitio. */
function SectionToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-[hsl(0,0%,92%)] last:border-none">
      <div>
        <p className="text-sm font-semibold text-[hsl(0,0%,20%)]">{label}</p>
        <p className="text-xs text-[hsl(0,0%,55%)] mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
          value ? "bg-[hsl(20,60%,45%)]" : "bg-[hsl(0,0%,80%)]"
        }`}
      >
        <span
          className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 my-0.5 ${
            value ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSitePage() {
  const { checking } = useAdminAuth();
  const { show, ToastComponent } = useToast();
  const [config, setConfig] = useState<ISiteConfig | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/content/site-config")
      .then((r) => r.json())
      .then((d: ISiteConfig) => setConfig(d));
  }, []);

  async function save() {
    if (!config) return;
    setSaving(true);
    await fetch("/api/content/site-config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        showMaterials: config.showMaterials,
        showShowroom: config.showShowroom,
      }),
    });
    setSaving(false);
    show("Configuración guardada");
  }

  if (checking || !config) return <AdminPageSkeleton />;

  return (
    <>
      <Head><title>Configuración del Sitio — Admin Rivera</title></Head>
      <PageHeader
        title="Configuración del Sitio"
        subtitle="Controla la visibilidad de las secciones en el home"
      />

      <FormCard>
        <p className="text-xs font-bold uppercase tracking-wider text-[hsl(0,0%,50%)] mb-4">
          SECCIONES DEL HOME
        </p>
        <SectionToggle
          label='Sección "Pisos y Acabados"'
          description="Muestra u oculta el carrusel de materiales en la página principal."
          value={config.showMaterials}
          onChange={(v) => setConfig((c) => c ? { ...c, showMaterials: v } : c)}
        />
        <SectionToggle
          label='Sección "Showroom"'
          description="Muestra u oculta la sección del showroom en la página principal."
          value={config.showShowroom}
          onChange={(v) => setConfig((c) => c ? { ...c, showShowroom: v } : c)}
        />
      </FormCard>

      <SaveButton saving={saving} onClick={save} />
      {ToastComponent}
    </>
  );
}
