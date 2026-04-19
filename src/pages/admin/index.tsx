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
  FileText,
} from "lucide-react";

type Section = { href: string; label: string; desc: string; icon: React.ElementType };

const GROUPS: { label: string; items: Section[] }[] = [
  {
    label: "Contenido",
    items: [
      { href: "/admin/hero-slides", label: "Hero Carrusel", desc: "Diapositivas, textos y botones del hero principal", icon: ImageIcon },
      { href: "/admin/services", label: "Servicios", desc: "Tarjetas de ventas / servicios destacados", icon: Wrench },
      { href: "/admin/catalog", label: "Catálogo", desc: "Texto descriptivo y PDF descargable del catálogo", icon: BookOpen },
      { href: "/admin/page-sections", label: "Secciones del home", desc: "Orden y visibilidad de secciones del home", icon: LayoutList },
      { href: "/admin/paginas", label: "Páginas", desc: "Páginas propias como Nosotros, Servicios, etc.", icon: FileText },
    ],
  },
  {
    label: "Catálogo de materiales",
    items: [
      { href: "/admin/categorias", label: "Categorías", desc: "Pisos, Paredes, Ventanas…", icon: FolderOpen },
      { href: "/admin/subcategorias", label: "Subcategorías", desc: "Pisos Laminados, Pisos de Madera, SPC…", icon: Package },
      { href: "/admin/productos", label: "Productos", desc: "Fichas de productos con medidas, galería y PDF técnico", icon: Layers },
    ],
  },
  {
    label: "Proyectos",
    items: [
      { href: "/admin/proyectos", label: "Proyectos recientes", desc: "Portfolio de instalaciones con galería y etiquetas de ambiente", icon: Grid2x2 },
    ],
  },
  {
    label: "Configuración",
    items: [
      { href: "/admin/nav-items", label: "Navegación", desc: "Árbol de menú de 3 niveles", icon: Navigation },
      { href: "/admin/contact", label: "Contacto", desc: "Teléfonos, email y opciones del formulario", icon: Phone },
      { href: "/admin/footer", label: "Footer", desc: "Tagline y columnas del pie de página", icon: Layout },
      { href: "/admin/seo", label: "SEO", desc: "Título, descripción y palabras clave", icon: Search },
      { href: "/admin/media", label: "Medios", desc: "Subir y gestionar imágenes y PDFs", icon: Upload },
    ],
  },
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

      <div className="space-y-8">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-bold tracking-[0.15em] uppercase text-[hsl(0,0%,50%)] mb-3">
              {group.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map(({ href, label, desc, icon: Icon }) => (
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
          </div>
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
