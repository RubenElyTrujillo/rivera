import * as React from "react";
import { MetricCard } from "./MetricCard";

interface MetricsData {
  productos: number;
  productosSinImagenes: number;
  proyectos: number;
  servicios: number;
  categorias: number;
  ultimaActividad: Date | null;
}

interface AdminMetricsState {
  data: MetricsData | null;
  loading: boolean;
  error: boolean;
}

function formatLastActivity(date: Date | null): string {
  if (!date) return "N/A";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Hace un momento";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-ES");
}

export function AdminMetrics() {
  const [state, setState] = React.useState<AdminMetricsState>({
    data: null,
    loading: true,
    error: false,
  });

  React.useEffect(() => {
    async function fetchMetrics() {
      try {
        const [productosRes, proyectosRes, serviciosRes, categoriasRes, siteConfigRes] = await Promise.all([
          fetch("/api/catalog/productos"),
          fetch("/api/proyectos"),
          fetch("/api/content/services"),
          fetch("/api/catalog/categorias"),
          fetch("/api/content/site-config"),
        ]);

        if (!productosRes.ok || !proyectosRes.ok || !serviciosRes.ok || !categoriasRes.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const [productos, proyectos, servicios, categorias, siteConfig] = await Promise.all([
          productosRes.json(),
          proyectosRes.json(),
          serviciosRes.json(),
          categoriasRes.json(),
          siteConfigRes.ok ? siteConfigRes.json() : null,
        ]);

        const productosArray = Array.isArray(productos) ? productos : [];
        const productosSinImagenes = productosArray.filter(
          (p: { coverImage?: string | null }) => !p.coverImage
        ).length;

        setState({
          data: {
            productos: productosArray.length,
            productosSinImagenes,
            proyectos: Array.isArray(proyectos) ? proyectos.length : 0,
            servicios: Array.isArray(servicios) ? servicios.length : 0,
            categorias: Array.isArray(categorias) ? categorias.length : 0,
            ultimaActividad: siteConfig?.updatedAt ? new Date(siteConfig.updatedAt) : null,
          },
          loading: false,
          error: false,
        });
      } catch {
        setState({ data: null, loading: false, error: true });
      }
    }

    fetchMetrics();
  }, []);

  if (state.loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 animate-pulse"
          >
            <div className="flex items-start justify-between">
              <div className="h-4 bg-[hsl(0,0%,90%)] rounded w-24" />
              <div className="h-9 w-9 bg-[hsl(0,0%,90%)] rounded-lg" />
            </div>
            <div className="mt-4 h-8 bg-[hsl(0,0%,90%)] rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (state.error || !state.data) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <MetricCard label="Total Productos" value={state.data.productos} icon="Package" />
      <MetricCard label="Sin imágenes" value={state.data.productosSinImagenes} icon="ImageIcon" />
      <MetricCard label="Proyectos" value={state.data.proyectos} icon="Grid2x2" />
      <MetricCard label="Servicios" value={state.data.servicios} icon="Layers" />
      <MetricCard label="Categorías" value={state.data.categorias} icon="FileText" />
      <MetricCard
        label="Última actividad"
        value={formatLastActivity(state.data.ultimaActividad)}
        icon="Clock"
      />
    </div>
  );
}
