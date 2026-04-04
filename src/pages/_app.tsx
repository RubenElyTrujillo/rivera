import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import AdminLayout from "@/components/admin/AdminLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  const isLogin = router.pathname === "/admin/login";
  const isGallery = router.pathname.startsWith("/materiales");

  if (isAdmin && !isLogin) {
    return (
      <AdminLayout>
        <div key={router.pathname} className="admin-page-transition">
          <Component {...pageProps} />
        </div>
      </AdminLayout>
    );
  }

  if (isGallery) {
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
