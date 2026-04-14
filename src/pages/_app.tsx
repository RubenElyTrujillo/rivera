import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import type { WhatsAppContext } from "@/hooks/useWhatsApp";
import "@/styles/globals.css";
import type { INavItem } from "@/domain/types";

const WhatsAppFAB = dynamic(() => import("@/components/ui/WhatsAppFAB"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  const isLogin = router.pathname === "/admin/login";

  const whatsappPhone: string = (pageProps.whatsappPhone as string) ?? "";
  const whatsappContext: WhatsAppContext | undefined = pageProps.whatsappContext as WhatsAppContext | undefined;
  const navItems: INavItem[] = (pageProps.navItems as INavItem[]) ?? [];

  if (isAdmin && !isLogin) {
    return (
      <AdminLayout>
        <div key={router.pathname} className="admin-page-transition">
          <Component {...pageProps} />
        </div>
      </AdminLayout>
    );
  }

  return (
    <MainLayout navItems={navItems}>
      <Component {...pageProps} />
      <WhatsAppFAB phone={whatsappPhone} context={whatsappContext} />
    </MainLayout>
  );
}
