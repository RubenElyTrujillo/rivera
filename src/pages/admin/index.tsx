import Head from "next/head";
import Link from "next/link";
import { useAdminAuth, PageHeader, AdminDashboardSkeleton } from "@/components/admin/adminUtils";
import {
  ImageIcon,
  Wrench,
  Package,
  Grid2x2,
  BookOpen,
  Phone,
  Layout,
  Search,
  Upload,
  FolderOpen,
  Navigation,
  Layers,
  LayoutList,
} from "lucide-react";

const SECTIONS = [
  { href: "/admin/hero", label: "Hero", desc: "Título, subtítulo e imagen principal", icon: ImageIcon },
  { href: "/admin/services", label: "Ventas", desc: "5 tarjetas de ventas", icon: Wrench },
  { href: "/admin/materials", label: "Líneas", desc: "Líneas de producto (Pisos Laminados, Pisos de Madera…)", icon: Package },
  { href: "/admin/categories", label: "Categorías de proyectos", desc: "Categorías para el showcase de proyectos", icon: FolderOpen },
  { href: "/admin/nav-items", label: "Navegación", desc: "Árbol de menú de 3 niveles", icon: Navigation },
  { href: "/admin/spaces", label: "Proyectos", desc: "Proyectos realizados por Rivera", icon: Grid2x2 },
  { href: "/admin/catalog", label: "Catálogo", desc: "Texto y PDF descargable", icon: BookOpen },
  { href: "/admin/contact", label: "Contacto", desc: "Teléfonos, email y opciones del formulario", icon: Phone },
  { href: "/admin/footer", label: "Footer", desc: "Tagline y lista de servicios", icon: Layout },
  { href: "/admin/seo", label: "SEO", desc: "Título, descripción y palabras clave", icon: Search },
  { href: "/admin/media", label: "Medios", desc: "Subir y gestionar imágenes y PDFs", icon: Upload },
  { href: "/admin/collections", label: "Colecciones", desc: "Subcategorías por material (Splash, Clásico, Select…)", icon: Layers },
  { href: "/admin/page-sections", label: "Secciones", desc: "Orden y visibilidad de secciones del home", icon: LayoutList },
];

export default function AdminDashboard() {
  const { checking } = useAdminAuth();
  if (checking) return <AdminDashboardSkeleton />;

  return (
    <>
      <Head><title>Dashboard — Admin Rivera</title></Head>
        <PageHeader
          title="Panel de administración"
          subtitle="Edita el contenido de cada sección del sitio web"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTIONS.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 hover:border-[hsl(20,60%,45%)] hover:shadow-sm transition-all group"
            >
              <Icon size={20} className="text-[hsl(20,60%,45%)] mb-3" />
              <p className="font-bold text-sm text-[hsl(0,0%,13%)] group-hover:text-[hsl(20,60%,45%)] transition-colors">
                {label}
              </p>
              <p className="text-xs text-[hsl(0,0%,55%)] mt-1">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[hsl(0,0%,50%)] hover:text-[hsl(20,60%,45%)] transition-colors"
          >
            Ver sitio público →
          </a>
        </div>
    </>
  );
}
