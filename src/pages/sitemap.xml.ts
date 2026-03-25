import type { GetServerSideProps } from "next";

const routes = [
  "",
  "CR%20CATALOGO.pdf",
];

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : "https";
  const host = req.headers.host ?? "localhost:3000";
  const baseUrl = `${protocol}://${host}`;
  const lastmod = new Date().toISOString();

  const urls = routes
    .map(
      (route) => `<url><loc>${baseUrl}/${route}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>${route === "" ? "1.0" : "0.7"}</priority></url>`
    )
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function SitemapXml() {
  return null;
}
