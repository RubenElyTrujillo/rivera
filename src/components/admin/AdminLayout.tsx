import { useRouter } from "next/router";
import Link from "next/link";
import {
  LayoutDashboard,
  Image as ImageIcon,
  Wrench,
  Package,
  Grid2x2,
  FolderOpen,
  BookOpen,
  Phone,
  Layout,
  Search,
  LogOut,
  Upload,
  Layers,
  Navigation,
  LayoutList,
} from "lucide-react";

type NavItem =
  | { type?: "link"; href: string; label: string; icon: React.ElementType }
  | { type: "sep"; label: string };

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },

  { type: "sep", label: "Contenido" },
  { href: "/admin/hero-slides", label: "Hero Carrusel", icon: ImageIcon },
  { href: "/admin/services", label: "Servicios", icon: Wrench },
  { href: "/admin/catalog", label: "Catálogo", icon: BookOpen },
  { href: "/admin/page-sections", label: "Secciones del home", icon: LayoutList },

  { type: "sep", label: "Catálogo de materiales" },
  { href: "/admin/categorias", label: "Categorías", icon: FolderOpen },
  { href: "/admin/subcategorias", label: "Subcategorías", icon: Package },
  { href: "/admin/productos", label: "Productos", icon: Layers },

  { type: "sep", label: "Proyectos" },
  { href: "/admin/proyectos", label: "Proyectos", icon: Grid2x2 },

  { type: "sep", label: "Configuración" },
  { href: "/admin/nav-items", label: "Navegación", icon: Navigation },
  { href: "/admin/contact", label: "Contacto", icon: Phone },
  { href: "/admin/footer", label: "Footer", icon: Layout },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/media", label: "Medios", icon: Upload },
];

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/admin/login";
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="flex bg-[hsl(0,0%,95%)]">
      {/* Sidebar */}
      <aside className="w-60 bg-[hsl(0,0%,13%)] text-white flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-xs tracking-[0.25em] text-white/40 uppercase font-bold">
            Admin
          </p>
          <p className="text-lg font-bold tracking-tight mt-1">
            Comer. <span className="text-[hsl(20,60%,55%)]">Rivera</span>
          </p>
        </div>

        <nav className="flex-1 px-3 py-4">
          {NAV_ITEMS.map((item, i) => {
            if (item.type === "sep") {
              return (
                <p key={`sep-${i}`} className="px-3 pt-4 pb-1 text-[10px] font-bold tracking-[0.15em] uppercase text-white/25">
                  {item.label}
                </p>
              );
            }
            const active = router.pathname === item.href || router.pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors mb-0.5 ${
                  active
                    ? "bg-[hsl(20,60%,45%)] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <LogOut size={15} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-screen overflow-auto">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
