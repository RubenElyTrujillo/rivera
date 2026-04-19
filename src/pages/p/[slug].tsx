import type { GetServerSideProps } from "next";
import Head from "next/head";
import { paginaRepository } from "@/repositories/pagina.repository";
import { navItemRepository } from "@/repositories/navItem.repository";
import { db } from "@/infrastructure/db/client";
import type { IPagina } from "@/domain/types/pagina";
import type { INavItem } from "@/domain/types";
import PaginaRenderer from "@/components/PaginaRenderer";
import FooterSection from "@/components/sections/FooterSection";
import type { IContactInfo, IFooterContent } from "@/interfaces";

interface Props {
  pagina: IPagina;
  navItems: INavItem[];
  contact: IContactInfo | null;
  footer: IFooterContent | null;
}

export default function CustomPage({ pagina, contact, footer }: Props) {
  const title = pagina.seoTitle ?? pagina.title;
  const description = pagina.seoDescription ?? "";

  return (
    <>
      <Head>
        <title>{title} | Comercializadora Rivera</title>
        {description && <meta name="description" content={description} />}
        <meta property="og:title" content={title} />
        {description && <meta property="og:description" content={description} />}
        {pagina.ogImage && <meta property="og:image" content={pagina.ogImage} />}
      </Head>
      <main className="pt-20">
        <PaginaRenderer blocks={pagina.bloques ?? []} />
      </main>
      <FooterSection contact={contact} footer={footer} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug ?? "");
  const pagina = await paginaRepository.findPublishedBySlug(slug);
  if (!pagina) return { notFound: true };

  const [navItems, contact, footerContent] = await Promise.all([
    navItemRepository.findRoots(),
    db.contactInfo.findFirst(),
    db.footerContent.findFirst(),
  ]);

  const parsedContact = contact
    ? { ...contact, surfaceOptions: (() => { try { return JSON.parse(contact.surfaceOptions) as string[]; } catch { return []; } })() }
    : null;

  const footer = footerContent
    ? { ...footerContent, services: (() => { try { return JSON.parse(footerContent.services) as string[]; } catch { return []; } })() }
    : null;

  return {
    props: {
      pagina: JSON.parse(JSON.stringify(pagina)) as IPagina,
      navItems: navItems as unknown as INavItem[],
      contact: parsedContact as unknown as IContactInfo | null,
      footer: footer as unknown as IFooterContent | null,
    },
  };
};
