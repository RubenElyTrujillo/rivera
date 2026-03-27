import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdmin = router.pathname.startsWith("/admin");
  const isGallery = router.pathname.startsWith("/materiales");

  if (isAdmin || isGallery) {
    return <Component {...pageProps} />;
  }

  return (
    <MainLayout>
      <Component {...pageProps} />
    </MainLayout>
  );
}
