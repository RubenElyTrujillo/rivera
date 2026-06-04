import Head from "next/head";
import { useAdminAuth, PageHeader, AdminDashboardSkeleton } from "@/components/admin/adminUtils";
import { ActionCard } from "@/components/admin/dashboard/ActionCard";
import { AdminMetrics } from "@/components/admin/dashboard/AdminMetrics";

export default function AdminDashboard() {
  const { checking } = useAdminAuth();
  if (checking) return <AdminDashboardSkeleton />;

  return (
    <>
      <Head><title>Dashboard — Admin Rivera</title></Head>
      <PageHeader
        title="Panel de administración"
        subtitle="Acciones rápidas y métricas del sitio"
      />

      <div className="space-y-8">
        {/* Quick Actions */}
        <section>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[hsl(0,0%,50%)] mb-4">
            Acciones rápidas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Agregar Producto"
              description="Crear una nueva ficha de producto en el catálogo"
              href="/admin/flows/agregar-producto"
              icon="Package"
              color="primary"
            />
            <ActionCard
              title="Agregar Proyecto"
              description="Registrar un nuevo proyecto en el portfolio"
              href="/admin/flows/agregar-proyecto"
              icon="Grid2x2"
              color="blue"
            />
            <ActionCard
              title="Actualizar Hero"
              description="Modificar el carrusel principal del sitio"
              href="/admin/flows/actualizar-hero"
              icon="Image"
              color="emerald"
            />
            <ActionCard
              title="Ver Sitio"
              description="Ver el sitio público"
              href="/"
              icon="FileText"
              color="gray"
            />
          </div>
        </section>

        {/* Metrics */}
        <section>
          <p className="text-xs font-bold tracking-[0.15em] uppercase text-[hsl(0,0%,50%)] mb-4">
            Métricas del sitio
          </p>
          <AdminMetrics />
        </section>
      </div>
    </>
  );
}
