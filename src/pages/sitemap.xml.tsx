import type { GetServerSideProps } from "next";
import { MATERIALS_DATA } from "@/lib/materialsData";

function generateSitemap(siteUrl: string): string {
  const today = new Date().toISOString().split("T")[0];

  const staticPages = [
    { url: `${siteUrl}/`, priority: "1.0", changefreq: "weekly" },
  ];

  const materialPages = MATERIALS_DATA.map((m) => ({
    url: `${siteUrl}/materiales/${m.id}`,
    priority: "0.8",
    changefreq: "monthly",
  }));

  const allPages = [...staticPages, ...materialPages];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://localhost:3000";
  const sitemap = generateSitemap(siteUrl);

  res.setHeader("Content-Type", "application/xml");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.write(sitemap);
  res.end();

  return { props: {} };
};

export default function Sitemap() {
  return null;
}
