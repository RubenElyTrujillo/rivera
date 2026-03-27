import Head from "next/head";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";
import { useAdminAuth, PageHeader } from "@/components/admin/adminUtils";
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
} from "lucide-react";

const SECTIONS = [
  { href: "/admin/hero", label: "Hero", desc: "Título, subtítulo e imagen principal", icon: ImageIcon },
  { href: "/admin/services", label: "Servicios", desc: "5 tarjetas de servicios", icon: Wrench },
  { href: "/admin/materials", label: "Materiales", desc: "Tipos de pisos y recubrimientos", icon: Package },
  { href: "/admin/spaces", label: "Espacios", desc: "Galería de proyectos", icon: Grid2x2 },
  { href: "/admin/catalog", label: "Catálogo", desc: "Texto y PDF descargable", icon: BookOpen },
  { href: "/admin/contact", label: "Contacto", desc: "Teléfonos, email y opciones del formulario", icon: Phone },
  { href: "/admin/footer", label: "Footer", desc: "Tagline y lista de servicios", icon: Layout },
  { href: "/admin/seo", label: "SEO", desc: "Título, descripción y palabras clave", icon: Search },
  { href: "/admin/media", label: "Medios", desc: "Subir y gestionar imágenes y PDFs", icon: Upload },
];

export default function AdminDashboard() {
  const { checking } = useAdminAuth();
  if (checking) return null;

  return (
    <>
      <Head><title>Dashboard — Admin Rivera</title></Head>
      <AdminLayout>
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
      </AdminLayout>
    </>
  );
}
