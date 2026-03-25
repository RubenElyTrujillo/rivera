import type { GetServerSideProps } from "next";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const protocol = typeof forwardedProto === "string" ? forwardedProto.split(",")[0] : "https";
  const host = req.headers.host ?? "localhost:3000";
  const baseUrl = `${protocol}://${host}`;

  const body = `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

  res.setHeader("Content-Type", "text/plain");
  res.write(body);
  res.end();

  return { props: {} };
};

export default function RobotsTxt() {
  return null;
}
