import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';
import { ArrowLeft, X } from 'lucide-react';
import { db } from '@/lib/db';
import { materialRepository } from '@/repositories/material.repository';
import { MATERIALS_DATA } from '@/lib/materialsData';
import type { IMaterial, IMaterialFinish, IMaterialCollection, INavItem } from '@/domain/types';
import { navItemRepository } from '@/repositories/navItem.repository';
import { collectionRepository } from '@/repositories/collection.repository';
import FinishCard from "@/components/ui/FinishCard";
import { buildWhatsAppUrl } from "@/hooks/useWhatsApp";

interface Props {
    material: IMaterial;
    collections: IMaterialCollection[];
    siteUrl: string;
    whatsappPhone: string;
    whatsappContext: { material: string };
    navItems: INavItem[];
}

function GalleryHeader({ name }: { name: string }) {
    return (
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
            <div className="px-6 md:px-16 py-5 flex items-center justify-between">
                <Link
                    href="/#materiales"
                    className="flex items-center gap-2 text-sm font-semibold tracking-wider text-foreground/50 hover:text-foreground transition-colors"
                >
                    <ArrowLeft size={16} />
                    VOLVER
                </Link>
                <div className="text-center">
                    <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold">GALERÍA</p>
                    <h1 className="text-sm md:text-base font-bold tracking-tight">{name}</h1>
                </div>
                <div className="w-16" />
            </div>
        </div>
    );
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const raw = params?.id as string;
    const numId = parseInt(raw, 10);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';

    // Numeric ID → DB lookup
    if (!isNaN(numId)) {
        const material = await materialRepository.findById(numId);
        if (!material) return { notFound: true };
        const [contact, collections, navItems] = await Promise.all([
            db.contactInfo.findFirst(),
            collectionRepository.findByMaterial(material.id),
            navItemRepository.findRoots(),
        ]);
        return {
            props: {
                material,
                collections,
                siteUrl,
                whatsappPhone: contact?.whatsappPhone ?? "",
                whatsappContext: { material: material.name },
                navItems,
            },
        };
    }

    // String slug → try DB first, then static data
    const dbMaterial = await materialRepository.findBySlug(raw);
    if (dbMaterial) {
        const [contact, collections, navItems] = await Promise.all([
            db.contactInfo.findFirst(),
            collectionRepository.findByMaterial(dbMaterial.id),
            navItemRepository.findRoots(),
        ]);
        return {
            props: {
                material: dbMaterial,
                collections,
                siteUrl,
                whatsappPhone: contact?.whatsappPhone ?? "",
                whatsappContext: { material: dbMaterial.name },
                navItems,
            },
        };
    }

    // Fall back to static data
    const staticMat = MATERIALS_DATA.find((m) => m.id === raw);
    if (!staticMat) return { notFound: true };

    const material: IMaterial = {
        id: 0,
        slug: raw,
        name: staticMat.name,
        subtitle: staticMat.shortName,
        desc: staticMat.description,
        spec: staticMat.spec,
        coverImage: staticMat.coverImage,
        collections: [...new Set(staticMat.finishes.map((f) => f.collection))].filter((c): c is string => !!c),
        order: 0,
        categoryId: null,
        finishes: staticMat.finishes.map<IMaterialFinish>((f, i) => ({
            id: i,
            materialId: 0,
            name: f.name,
            slug: f.code || f.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            code: f.code,
            collection: f.collection,
            image: f.image,
            dims: f.dims,
            desc: '',
            order: i,
            hoverImage: '',
            pdfUrl: '',
            thickness: '',
            useClass: '',
            waterRes: false,
            installType: '',
            warranty: '',
            specMd: '',
            collectionId: 0,
        })),
    };

    const [contact, navItems] = await Promise.all([
        db.contactInfo.findFirst(),
        navItemRepository.findRoots(),
    ]);
    return {
        props: {
            material: material as unknown as IMaterial,
            collections: [],
            siteUrl,
            whatsappPhone: contact?.whatsappPhone ?? "",
            whatsappContext: { material: (material as { name: string }).name },
            navItems,
        },
    };
};

function GallerySection({
    material,
    whatsappPhone,
}: {
    material: IMaterial;
    whatsappPhone: string;
    whatsappContext: { material: string };
}) {
    const [selectedFinish, setSelectedFinish] = useState<IMaterialFinish | null>(null);
    const [activeCollection, setActiveCollection] = useState('Todos');

    const finishCollections = ['Todos', ...Array.from(new Set(material.finishes.map((f) => f.collection).filter((c): c is string => !!c)))];
    const filtered = activeCollection === 'Todos'
        ? material.finishes
        : material.finishes.filter((f) => f.collection === activeCollection);

    return (
        <div className="bg-background">
            <GalleryHeader name={material.name} />

            {/* Hero strip */}
            <div className="relative h-40 md:h-56 overflow-hidden bg-foreground">
                {material.coverImage && (
                    <Image
                        src={material.coverImage}
                        alt={`Textura de ${material.name} — Comercializadora Rivera`}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-foreground/60" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16">
                    <p className="text-background/50 text-xs tracking-[0.3em] uppercase mb-2">
                        {material.finishes.length} acabados disponibles
                    </p>
                    <h2 className="text-background text-2xl md:text-4xl font-bold tracking-tight">{material.name}</h2>
                    <p className="text-background/60 text-xs tracking-widest mt-2 font-mono">{material.spec}</p>
                </div>
            </div>

            {/* ¿Qué es este material? */}
            {material.desc && (
                <section className="px-6 md:px-16 py-12 md:py-16 border-b border-foreground/10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold mb-3">
                            SOBRE ESTE MATERIAL
                        </p>
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
                            ¿Qué es el {material.name.toLowerCase()}?
                        </h2>
                        <p className="text-foreground/60 leading-relaxed max-w-2xl text-base">
                            {material.desc}
                        </p>
                        {material.spec && (
                            <p className="mt-4 text-sm font-mono text-foreground/40">{material.spec}</p>
                        )}
                    </motion.div>
                </section>
            )}

            {/* Collection filter */}
            {finishCollections.length > 1 && (
                <div className="px-6 md:px-16 py-8 border-b border-foreground/10 overflow-x-auto hide-scrollbar">
                    <div className="flex gap-6">
                        {finishCollections.map((col) => (
                            <button
                                key={col}
                                onClick={() => setActiveCollection(col)}
                                className={`text-xs tracking-[0.2em] uppercase font-semibold pb-2 border-b-2 transition-all whitespace-nowrap ${activeCollection === col
                                        ? 'border-primary text-foreground'
                                        : 'border-transparent text-foreground/40 hover:text-foreground'
                                    }`}
                            >
                                {col}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className="px-6 md:px-16 py-12">
                {filtered.length === 0 ? (
                    <p className="text-foreground/40 text-sm text-center py-20">
                        Aún no hay acabados registrados para este material.
                    </p>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        <AnimatePresence mode="popLayout">
                            {filtered.map((finish, i) => (
                                <motion.div
                                    key={finish.code}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.35, delay: i * 0.04 }}
                                >
                                    <FinishCard
                                        finish={finish}
                                        onClick={() => setSelectedFinish(finish)}
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedFinish && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-foreground/95 flex items-center justify-center p-6"
                        onClick={() => setSelectedFinish(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-background max-w-lg w-full overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative aspect-[4/3] overflow-hidden bg-foreground/5">
                                {selectedFinish.image && (
                                    <Image
                                        src={selectedFinish.image}
                                        alt={selectedFinish.name}
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                <button
                                    aria-label="Cerrar"
                                    onClick={() => setSelectedFinish(null)}
                                    className="absolute top-4 right-4 bg-foreground/80 text-background p-2 hover:bg-foreground transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                            <div className="p-8">
                                {selectedFinish.collection && (
                                    <p className="text-xs text-primary tracking-[0.2em] uppercase font-bold mb-1">
                                        {selectedFinish.collection}
                                    </p>
                                )}
                                <h3 className="text-xl font-bold tracking-tight mb-4">{selectedFinish.name}</h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-foreground/40 tracking-widest uppercase mb-1">Código</p>
                                        <p className="text-sm font-mono font-semibold">{selectedFinish.code}</p>
                                    </div>
                                    {selectedFinish.dims && (
                                        <div>
                                            <p className="text-xs text-foreground/40 tracking-widest uppercase mb-1">Dimensiones</p>
                                            <p className="text-sm font-mono font-semibold">{selectedFinish.dims}</p>
                                        </div>
                                    )}
                                </div>
                                {/* Ficha técnica */}
                                {(selectedFinish.thickness || selectedFinish.useClass || selectedFinish.installType || selectedFinish.warranty || selectedFinish.waterRes) && (
                                    <div className="border-t border-foreground/10 pt-4 mb-4">
                                        <p className="text-xs text-foreground/40 tracking-widest uppercase mb-3">Ficha técnica</p>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {selectedFinish.thickness && (
                                                <div>
                                                    <p className="text-xs text-foreground/40 uppercase tracking-widest mb-0.5">Espesor</p>
                                                    <p className="font-semibold">{selectedFinish.thickness}</p>
                                                </div>
                                            )}
                                            {selectedFinish.useClass && (
                                                <div>
                                                    <p className="text-xs text-foreground/40 uppercase tracking-widest mb-0.5">Clase de uso</p>
                                                    <p className="font-semibold">{selectedFinish.useClass}</p>
                                                </div>
                                            )}
                                            {selectedFinish.installType && (
                                                <div>
                                                    <p className="text-xs text-foreground/40 uppercase tracking-widest mb-0.5">Instalación</p>
                                                    <p className="font-semibold">{selectedFinish.installType}</p>
                                                </div>
                                            )}
                                            {selectedFinish.warranty && (
                                                <div>
                                                    <p className="text-xs text-foreground/40 uppercase tracking-widest mb-0.5">Garantía</p>
                                                    <p className="font-semibold">{selectedFinish.warranty}</p>
                                                </div>
                                            )}
                                            <div className="col-span-2">
                                                <p className="text-xs text-foreground/40 uppercase tracking-widest mb-0.5">Resistencia al agua</p>
                                                <p className="font-semibold">{selectedFinish.waterRes ? "✓ Resistente al agua" : "No especificado"}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {/* PDF download */}
                                {selectedFinish.pdfUrl && (
                                    <a
                                        href={selectedFinish.pdfUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block text-center border border-foreground/20 text-foreground/70 py-3 text-xs font-bold tracking-widest uppercase hover:border-foreground hover:text-foreground transition-colors mb-4"
                                    >
                                        DESCARGAR FICHA TÉCNICA (PDF)
                                    </a>
                                )}
                                <a
                                    href={buildWhatsAppUrl(whatsappPhone, {
                                        material: material.name,
                                        collection: selectedFinish.collection ?? undefined,
                                        product: selectedFinish.name,
                                        code: selectedFinish.code,
                                    }).url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-center bg-foreground text-background py-4 text-xs font-bold tracking-widest uppercase hover:bg-primary transition-colors"
                                >
                                    COTIZAR ESTE ACABADO
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function MaterialPage({
    material,
    collections,
    navItems: _navItems,
    siteUrl,
    whatsappPhone,
    whatsappContext,
}: Props) {
    const pageUrl = siteUrl ? `${siteUrl}/materiales/${material.slug || material.id}` : undefined;
    const ogImage = material.coverImage?.startsWith('/')
        ? siteUrl ? `${siteUrl}${material.coverImage}` : material.coverImage
        : material.coverImage;

    const seoTitle = `${material.name} — Pisos y Acabados | Comercializadora Rivera`;
    const seoDescription = `${material.desc ?? ''} ${material.spec ?? ''}. Ver ${material.finishes.length} acabados disponibles. Instalación profesional en CDMX.`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                name: material.name,
                description: material.desc,
                image: ogImage,
                url: pageUrl,
                brand: { '@type': 'Brand', name: 'Comercializadora Rivera' },
                offers: {
                    '@type': 'AggregateOffer',
                    availability: 'https://schema.org/InStock',
                    seller: { '@type': 'Organization', name: 'Comercializadora Rivera' },
                },
            },
            {
                '@type': 'ItemList',
                name: `Acabados de ${material.name}`,
                numberOfItems: material.finishes.length,
                itemListElement: material.finishes.map((finish, i) => ({
                    '@type': 'ListItem',
                    position: i + 1,
                    name: finish.name,
                    item: {
                        '@type': 'Product',
                        name: finish.name,
                        sku: finish.code,
                        image: finish.image,
                        description: `${finish.name} (${finish.code})${finish.dims ? ` — ${finish.dims}` : ''}`,
                    },
                })),
            },
        ],
    };

    return (
        <>
            <Head>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <meta name="keywords" content={`${material.name.toLowerCase()}, pisos, recubrimientos, ${material.finishes.map(f => f.name.toLowerCase()).slice(0, 5).join(', ')}, instalacion pisos cdmx, Comercializadora Rivera`} />
                <meta name="robots" content="index, follow, max-image-preview:large" />

                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="Comercializadora Rivera" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                {ogImage && <meta property="og:image" content={ogImage} />}
                {pageUrl && <meta property="og:url" content={pageUrl} />}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle} />
                <meta name="twitter:description" content={seoDescription} />
                {ogImage && <meta name="twitter:image" content={ogImage} />}

                {pageUrl && <link rel="canonical" href={pageUrl} />}

                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </Head>

            {collections.length > 0 ? (
                <main className="min-h-screen bg-foreground pt-24">
                    {/* Hero banner */}
                    <div className="relative h-64 md:h-96 overflow-hidden">
                        {material.coverImage && (
                            <Image src={material.coverImage} alt={material.name} fill className="object-cover" priority />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60" />
                        <div className="absolute bottom-0 left-0 px-8 md:px-20 pb-10">
                            <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-2">
                                MATERIALES
                            </p>
                            <h1 className="text-white text-4xl md:text-6xl font-bold tracking-tight">
                                {material.name}
                            </h1>
                        </div>
                    </div>

                    {/* "¿Qué es?" section */}
                    {material.desc && (
                        <section className="px-8 md:px-20 py-16 md:py-24 bg-background">
                            <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-4">
                                ¿QUÉ ES?
                            </p>
                            <p className="text-foreground/80 text-base md:text-lg max-w-3xl leading-relaxed">
                                {material.desc}
                            </p>
                        </section>
                    )}

                    {/* Collections grid */}
                    <section className="px-8 md:px-20 py-16 bg-foreground">
                        <h2 className="text-background text-2xl md:text-4xl font-bold tracking-tight mb-10">
                            Colecciones
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {collections.map((col) => (
                                <Link
                                    key={col.id}
                                    href={`/materiales/${material.slug || material.id}/${col.slug}`}
                                    className="group relative overflow-hidden aspect-[4/3] block"
                                >
                                    {col.coverImage && (
                                        <Image src={col.coverImage} alt={col.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                    <div className="absolute bottom-0 left-0 p-5">
                                        <h3 className="text-white text-xl font-bold">{col.name}</h3>
                                        {col.desc && <p className="text-white/70 text-sm mt-1 line-clamp-2">{col.desc}</p>}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                </main>
            ) : (
                <GallerySection material={material} whatsappPhone={whatsappPhone} whatsappContext={whatsappContext} />
            )}
        </>
    );
}


