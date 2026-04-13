import React, { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import ReactMarkdown from 'react-markdown';
import { db } from '@/lib/db';
import { finishRepository } from '@/repositories/finish.repository';
import { navItemRepository } from '@/repositories/navItem.repository';
import type { IMaterial, IMaterialCollection, IMaterialFinish, IMaterialFinishImage, INavItem } from '@/domain/types';

interface Props {
    finish: IMaterialFinish & { images: IMaterialFinishImage[] };
    material: IMaterial;
    collection: IMaterialCollection;
    navItems: INavItem[];
    whatsappPhone: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async ({ params }) => {
    const finSlug = params?.finSlug as string;

    const finish = await finishRepository.findBySlug(finSlug);
    if (!finish) return { notFound: true };

    const [rawCollection, rawMaterial, contact, navItems] = await Promise.all([
        db.materialCollection.findUnique({ where: { id: finish.collectionId } }),
        db.material.findUnique({ where: { id: finish.materialId } }),
        db.contactInfo.findFirst(),
        navItemRepository.findRoots(),
    ]);
    if (!rawCollection || !rawMaterial) return { notFound: true };

    return {
        props: {
            finish: finish as unknown as Props['finish'],
            material: rawMaterial as unknown as IMaterial,
            collection: rawCollection as unknown as IMaterialCollection,
            navItems,
            whatsappPhone: contact?.whatsappPhone ?? '',
        },
    };
};

export default function FinishDetailPage({ finish, material, collection, navItems: _navItems, whatsappPhone }: Props) {
    const [activeImg, setActiveImg] = useState(finish.image ?? '');
    const allImages = [
        ...(finish.image ? [{ url: finish.image, caption: finish.name }] : []),
        ...(finish.images ?? []).map((img) => ({ url: img.url, caption: img.caption ?? finish.name })),
    ];
    const matHref = `/materiales/${material.slug || material.id}`;
    const colHref = `${matHref}/${collection.slug}`;
    const waMessage = `Hola, me interesa el acabado *${finish.name}* (${collection.name} — ${material.name})`;
    const waUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(waMessage)}`;

    return (
        <>
            <Head>
                <title>{`${finish.name} — ${collection.name} | ${material.name} | Rivera`}</title>
                <meta name="description" content={finish.desc || `${finish.name}, ${collection.name} de ${material.name}`} />
            </Head>

            <main className="min-h-screen bg-background pt-24">
                {/* Breadcrumb */}
                <nav className="px-8 md:px-20 pt-8 pb-4 flex items-center gap-2 text-foreground/40 text-xs tracking-wider uppercase font-semibold flex-wrap">
                    <Link href="/#materiales" className="hover:text-foreground transition-colors">Materiales</Link>
                    <span>/</span>
                    <Link href={matHref} className="hover:text-foreground transition-colors">{material.name}</Link>
                    <span>/</span>
                    <Link href={colHref} className="hover:text-foreground transition-colors">{collection.name}</Link>
                    <span>/</span>
                    <span className="text-foreground">{finish.name}</span>
                </nav>

                <div className="px-8 md:px-20 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Left: image gallery */}
                    <div>
                        <div className="relative aspect-square overflow-hidden bg-muted mb-4">
                            {activeImg ? (
                                <Image src={activeImg} alt={finish.name} fill className="object-cover" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <span className="text-muted-foreground text-sm">Sin imagen</span>
                                </div>
                            )}
                        </div>
                        {allImages.length > 1 && (
                            <div className="flex gap-3 flex-wrap">
                                {allImages.map((img) => (
                                    <button
                                        key={img.url}
                                        onClick={() => setActiveImg(img.url)}
                                        className={`relative w-20 h-20 overflow-hidden border-2 transition-colors ${activeImg === img.url ? 'border-primary' : 'border-transparent hover:border-foreground/20'}`}
                                    >
                                        <Image src={img.url} alt={img.caption} fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: details */}
                    <div>
                        <p className="text-primary text-xs tracking-[0.3em] uppercase font-semibold mb-2">{collection.name}</p>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">{finish.name}</h1>
                        {finish.code && <p className="text-foreground/50 text-sm mb-6">Código: {finish.code}</p>}
                        {finish.desc && <p className="text-foreground/70 text-base leading-relaxed mb-8">{finish.desc}</p>}

                        {/* Structured spec chips */}
                        {(finish.thickness || finish.useClass || finish.installType || finish.warranty || finish.dims) && (
                            <div className="grid grid-cols-2 gap-3 mb-8">
                                {finish.thickness && <SpecChip label="Grosor" value={finish.thickness} />}
                                {finish.useClass && <SpecChip label="Clase de uso" value={finish.useClass} />}
                                {finish.waterRes && <SpecChip label="Resist. agua" value="✓" />}
                                {finish.installType && <SpecChip label="Instalación" value={finish.installType} />}
                                {finish.warranty && <SpecChip label="Garantía" value={finish.warranty} />}
                                {finish.dims && <SpecChip label="Dimensiones" value={finish.dims} />}
                            </div>
                        )}

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 mb-8">
                            {whatsappPhone && (
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-primary text-primary-foreground text-center px-6 py-4 text-sm font-bold tracking-widest uppercase hover:opacity-90 transition-opacity"
                                >
                                    Cotizar por WhatsApp
                                </a>
                            )}
                            {finish.pdfUrl && (
                                <a
                                    href={finish.pdfUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 border border-foreground text-foreground text-center px-6 py-4 text-sm font-bold tracking-widest uppercase hover:bg-foreground hover:text-background transition-colors"
                                >
                                    Ficha técnica PDF
                                </a>
                            )}
                        </div>

                        {/* Free-form Markdown spec */}
                        {finish.specMd && (
                            <div className="prose prose-sm max-w-none border-t border-foreground/10 pt-8 mt-8">
                                <ReactMarkdown>{finish.specMd}</ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

function SpecChip({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-muted rounded px-3 py-2">
            <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-0.5">{label}</p>
            <p className="text-foreground text-sm font-medium">{value}</p>
        </div>
    );
}
