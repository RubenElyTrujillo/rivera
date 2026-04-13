import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSideProps } from "next";
import * as motion from "motion/react-client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { db } from "@/lib/db";
import { categoryRepository } from "@/repositories/category.repository";
import { materialRepository } from "@/repositories/material.repository";
import type { ICategory, IMaterial } from "@/domain/types";

interface Props {
  category: ICategory;
  materials: IMaterial[];
  whatsappPhone: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
  const slug = params?.slug as string;
  const category = await categoryRepository.findBySlug(slug);
  if (!category) return { notFound: true };

  const [materials, contact] = await Promise.all([
    materialRepository.findByCategory(category.id),
    db.contactInfo.findFirst(),
  ]);

  return {
    props: {
      category,
      materials,
      whatsappPhone: contact?.whatsappPhone ?? "",
    },
  };
};

export default function CategoryPage({ category, materials }: Props) {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>{`${category.name} — Pisos y Acabados | Comercializadora Rivera`}</title>
        <meta
          name="description"
          content={`Explora todos los materiales de ${category.name}. Catálogo completo con acabados, dimensiones y fichas técnicas.`}
        />
      </Head>

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
        <div className="px-6 md:px-16 py-5 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold tracking-wider text-foreground/50 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={16} />
            VOLVER
          </Link>
          <div className="text-center">
            <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold">CATEGORÍA</p>
            <h1 className="text-sm md:text-base font-bold tracking-tight">{category.name}</h1>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <main className="min-h-screen bg-foreground">
        {/* Category hero */}
        {category.coverImage && (
          <div className="relative h-64 md:h-80 overflow-hidden">
            <Image
              src={category.coverImage}
              alt={category.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/70" />
            <div className="absolute bottom-0 left-0 right-0 px-8 md:px-20 pb-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="text-white text-4xl md:text-6xl font-bold tracking-tight"
              >
                {category.name}
              </motion.h2>
            </div>
          </div>
        )}

        {/* Materials grid */}
        <div className="px-8 md:px-20 py-16 md:py-24">
          {materials.length === 0 ? (
            <p className="text-background/40 text-center py-20">
              No hay materiales disponibles en esta categoría aún.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px">
              {materials.map((material, i) => (
                <motion.button
                  key={material.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                  onClick={() => router.push(`/materiales/${material.id}`)}
                  className="group relative overflow-hidden text-left w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-foreground/20">
                    {material.coverImage && (
                      <img
                        src={material.coverImage}
                        alt={`${material.name} — Comercializadora Rivera`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-white/40 text-xs tracking-widest uppercase mb-1 font-mono">
                          {material.finishes.length} acabados
                        </p>
                        <h3 className="text-white text-xl md:text-2xl font-bold tracking-tight leading-tight">
                          {material.name}
                        </h3>
                        {material.desc && (
                          <p className="text-white/50 text-xs mt-2 leading-relaxed max-w-[260px] hidden md:block">
                            {material.desc}
                          </p>
                        )}
                      </div>
                      <div className="w-10 h-10 bg-primary flex items-center justify-center flex-shrink-0 ml-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <ArrowRight size={16} className="text-white" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
