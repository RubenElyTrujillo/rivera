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
  Settings,
  Layers,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero", icon: ImageIcon },
  { href: "/admin/services", label: "Servicios", icon: Wrench },
  { href: "/admin/materials", label: "Materiales", icon: Package },
  { href: "/admin/collections", label: "Colecciones", icon: Layers },
  { href: "/admin/space-categories", label: "Categorías", icon: FolderOpen },
  { href: "/admin/spaces", label: "Espacios", icon: Grid2x2 },
  { href: "/admin/catalog", label: "Catálogo", icon: BookOpen },
  { href: "/admin/contact", label: "Contacto", icon: Phone },
  { href: "/admin/footer", label: "Footer", icon: Layout },
  { href: "/admin/seo", label: "SEO", icon: Search },
  { href: "/admin/media", label: "Medios", icon: Upload },
  { href: "/admin/site", label: "Configuración", icon: Settings },
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

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = router.pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-colors ${active
                    ? "bg-[hsl(20,60%,45%)] text-white"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <LogOut size={16} />
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
