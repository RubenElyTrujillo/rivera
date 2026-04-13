// src/pages/materiales/[id]/[colSlug]/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import * as motion from 'motion/react-client';
import { db } from '@/lib/db';
import { materialRepository } from '@/repositories/material.repository';
import { finishRepository } from '@/repositories/finish.repository';
import { navItemRepository } from '@/repositories/navItem.repository';
import type { IMaterial, IMaterialCollection, IMaterialFinish, INavItem } from '@/domain/types';

interface Props {
    material: IMaterial;
    collection: IMaterialCollection;
    finishes: IMaterialFinish[];
    navItems: INavItem[];
    whatsappPhone: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const matSlug = params?.id as string;
    const colSlug = params?.colSlug as string;

    // Try slug first, then numeric ID
    const material = await materialRepository.findBySlug(matSlug)
        ?? (isNaN(Number(matSlug)) ? null : await materialRepository.findById(Number(matSlug)));
    if (!material) return { notFound: true };

    const collection = await db.materialCollection.findUnique({
        where: { materialId_slug: { materialId: material.id, slug: colSlug } },
    }).catch(() => null);
    if (!collection) return { notFound: true };

    const [finishes, contact, navItems] = await Promise.all([
        finishRepository.findByCollection(collection.id).catch(() => []),
        db.contactInfo.findFirst().catch(() => null),
        navItemRepository.findRoots().catch(() => []),
    ]);

    return {
        props: {
            material: material as unknown as IMaterial,
            collection: collection as unknown as IMaterialCollection,
            finishes,
            navItems,
            whatsappPhone: contact?.whatsappPhone ?? '',
        },
    };
};

export default function CollectionPage({ material, collection, finishes, navItems: _navItems, whatsappPhone }: Props) {
    const matHref = `/materiales/${material.slug || material.id}`;
    const wa = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hola, me interesa la colección *${collection.name}* de ${material.name}`)}`;

    return (
        <>
            <Head>
                <title>{`${collection.name} — ${material.name} | Rivera`}</title>
                <meta name="description" content={collection.desc || `${collection.name}, colección de ${material.name}`} />
            </Head>

            <main className="min-h-screen bg-foreground pt-24">
                {/* Hero banner */}
                <div className="relative h-48 md:h-72 overflow-hidden">
                    {collection.coverImage && (
                        <Image src={collection.coverImage} alt={collection.name} fill className="object-cover" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
                    <div className="absolute bottom-0 left-0 px-8 md:px-20 pb-8">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-white/60 text-xs tracking-wider uppercase font-semibold mb-3">
                            <Link href="/#materiales" className="hover:text-white transition-colors">Materiales</Link>
                            <span>/</span>
                            <Link href={matHref} className="hover:text-white transition-colors">{material.name}</Link>
                            <span>/</span>
                            <span className="text-white">{collection.name}</span>
                        </nav>
                        <h1 className="text-white text-3xl md:text-5xl font-bold tracking-tight">{collection.name}</h1>
                        {collection.desc && (
                            <p className="text-white/70 text-sm mt-2 max-w-xl">{collection.desc}</p>
                        )}
                    </div>
                </div>

                {/* Finishes grid */}
                <section className="px-8 md:px-20 py-16">
                    {finishes.length === 0 ? (
                        <p className="text-background/40 text-center py-20">No hay acabados en esta colección aún.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {finishes.map((finish, i) => (
                                <motion.div
                                    key={finish.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                >
                                    <Link href={`${matHref}/${collection.slug}/${finish.slug}`}>
                                        <div className="group relative overflow-hidden aspect-square bg-muted">
                                            {finish.image && (
                                                <Image
                                                    src={finish.image}
                                                    alt={finish.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                                <p className="text-white text-xs font-semibold truncate">{finish.name}</p>
                                                {finish.code && <p className="text-white/60 text-xs truncate">{finish.code}</p>}
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* WhatsApp CTA */}
                <div className="px-8 md:px-20 pb-20 text-center">
                    <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
                    >
                        Cotizar esta colección
                    </a>
                </div>
            </main>
        </>
    );
}
