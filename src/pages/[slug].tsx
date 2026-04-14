import type { GetServerSideProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client";
import { navItemRepository } from "@/repositories/navItem.repository";
import TopBar from "@/components/navigation/TopBar";
import type { INavItem } from "@/domain/types";

interface CategoryPageProps {
  item: INavItem;
  navItems: INavItem[];
}

export default function CategoryPage({ item, navItems }: CategoryPageProps) {
  const children = (item.children ?? []) as INavItem[];

  return (
    <>
      <Head>
        <title>{item.label} — Rivera</title>
        <meta
          name="description"
          content={item.description ?? `Conoce nuestra línea de ${item.label}`}
        />
      </Head>

      <TopBar navItems={navItems} />

      {/* Cover */}
      <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
        {item.coverImage ? (
          <Image
            src={item.coverImage}
            alt={item.label}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-600" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />
        <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-8 md:px-20">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="text-white text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              {item.label}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Description */}
      {item.description && (
        <section className="max-w-4xl mx-auto px-8 py-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-foreground/80 text-lg leading-relaxed"
          >
            {item.description}
          </motion.p>
        </section>
      )}

      {/* Sub-categories */}
      {children.length > 0 && (
        <section className="max-w-6xl mx-auto px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child, i) => (
              <motion.div
                key={child.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Link
                  href={child.slug ? `/${child.slug}` : child.href || "#"}
                  className="group block rounded-lg overflow-hidden border border-foreground/10 hover:border-amber-700/40 transition-colors bg-background hover:shadow-lg"
                >
                  <div className="relative h-48 bg-neutral-100">
                    {child.coverImage ? (
                      <Image
                        src={child.coverImage}
                        alt={child.label}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                        <span className="text-neutral-400 text-sm">Sin imagen</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="font-semibold text-foreground group-hover:text-amber-700 transition-colors">
                      {child.label}
                    </h2>
                    {child.description && (
                      <p className="mt-1 text-sm text-foreground/60 line-clamp-2">
                        {child.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps<CategoryPageProps> = async ({ params }) => {
  const slug = params?.slug as string;
  const [item, navRoots] = await Promise.all([
    navItemRepository.findBySlug(slug),
    navItemRepository.findRoots(),
  ]);

  if (!item) return { notFound: true };

  return {
    props: {
      item: JSON.parse(JSON.stringify(item)) as INavItem,
      navItems: JSON.parse(JSON.stringify(navRoots)) as INavItem[],
    },
  };
};
