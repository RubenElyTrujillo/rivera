import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

/**
 * Hook que verifica si el usuario está autenticado.
 * Redirige a /admin/login si no lo está.
 */
export function useAdminAuth() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => {
        if (!r.ok) router.replace("/admin/login");
        else setChecking(false);
      })
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  return { checking };
}

/** Componente de campo de formulario con label */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold tracking-wider text-[hsl(0,0%,40%)] uppercase">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-[hsl(0,0%,55%)]">{hint}</p>}
    </div>
  );
}

/** Input estilizado para el panel admin */
export function AdminInput({
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] focus:border-transparent"
    />
  );
}

/** Textarea estilizado para el panel admin */
export function AdminTextarea({
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-[hsl(0,0%,80%)] rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[hsl(20,60%,45%)] focus:border-transparent resize-y"
    />
  );
}

/** Botón primario del admin */
export function SaveButton({
  saving,
  onClick,
  label = "Guardar cambios",
}: {
  saving: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="bg-[hsl(20,60%,45%)] text-white px-6 py-2.5 text-sm font-bold tracking-wider rounded hover:bg-[hsl(20,60%,38%)] transition-colors disabled:opacity-50"
    >
      {saving ? "Guardando..." : label}
    </button>
  );
}

/** Skeleton de carga para páginas de formulario */
export function AdminPageSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-7 w-56 bg-[hsl(0,0%,88%)] rounded mb-2" />
        <div className="h-4 w-80 bg-[hsl(0,0%,92%)] rounded" />
      </div>
      {/* Card skeleton */}
      <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-6 space-y-5">
        {[80, 64, 96, 72].map((w, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 rounded bg-[hsl(0,0%,88%)]" style={{ width: `${w}px` }} />
            <div className="h-9 rounded bg-[hsl(0,0%,93%)] w-full" />
          </div>
        ))}
        <div className="h-10 w-36 rounded bg-[hsl(0,0%,88%)]" />
      </div>
    </div>
  );
}

/** Skeleton de carga para el dashboard (grid de cards) */
export function AdminDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8">
        <div className="h-7 w-64 bg-[hsl(0,0%,88%)] rounded mb-2" />
        <div className="h-4 w-96 bg-[hsl(0,0%,92%)] rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 space-y-2">
            <div className="h-5 w-5 rounded bg-[hsl(0,0%,88%)]" />
            <div className="h-4 w-28 rounded bg-[hsl(0,0%,88%)]" />
            <div className="h-3 w-40 rounded bg-[hsl(0,0%,92%)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Encabezado de página del admin */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight text-[hsl(0,0%,13%)]">{title}</h1>
      {subtitle && <p className="text-sm text-[hsl(0,0%,50%)] mt-1">{subtitle}</p>}
    </div>
  );
}

/** Card contenedor de formulario */
export function FormCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-6 space-y-5">
      {children}
    </div>
  );
}

/** Toast de confirmación */
export function useToast() {
  const [toast, setToast] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastComponent = toast ? (
    <div className="fixed bottom-6 right-6 bg-[hsl(0,0%,13%)] text-white px-5 py-3 rounded shadow-lg text-sm font-medium z-50">
      {toast}
    </div>
  ) : null;

  return { show, ToastComponent };
}
