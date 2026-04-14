import { useState } from "react"
import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { productoRepository } from "@/repositories/producto.repository"
import { getSharedProps } from "@/lib/getSharedProps"
import type { IProducto, INavItem } from "@/domain/types"

interface Props {
  producto: IProducto
  navItems: INavItem[]
  whatsappPhone: string
}

export default function ProductoPage({ producto }: Props) {
  const subcategoria = producto.subcategoria!
  const categoria = subcategoria.categoria!
  const imagenes = producto.imagenes ?? []
  const [activeImg, setActiveImg] = useState(producto.coverImage ?? "")

  const allImgs = [
    ...(producto.coverImage ? [{ url: producto.coverImage, caption: null }] : []),
    ...imagenes.map(i => ({ url: i.url, caption: i.caption })),
  ]

  return (
    <>
      <Head>
        <title>{producto.name} — Rivera</title>
        <meta name="description" content={producto.shortDesc ?? `${producto.name} — Rivera`} />
      </Head>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 pt-24">
        <nav className="text-sm text-[hsl(0,0%,55%)]">
          <Link href="/" className="hover:text-[hsl(20,60%,45%)] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={`/${categoria.slug}`} className="hover:text-[hsl(20,60%,45%)] transition-colors">{categoria.name}</Link>
          <span className="mx-2">/</span>
          <Link href={`/${categoria.slug}/${subcategoria.slug}`} className="hover:text-[hsl(20,60%,45%)] transition-colors">{subcategoria.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(0,0%,20%)]">{producto.name}</span>
        </nav>
      </div>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 md:px-12 pb-16">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">

          {/* Left: Gallery */}
          <div>
            {/* Main image */}
            <div className="aspect-square rounded-xl overflow-hidden bg-[hsl(0,0%,90%)] mb-3">
              {activeImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImg} alt={producto.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[hsl(20,30%,85%)] to-[hsl(20,20%,75%)]" />
              )}
            </div>
            {/* Thumbnails */}
            {allImgs.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImgs.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImg(img.url)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImg === img.url ? "border-[hsl(20,60%,45%)]" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={img.caption ?? ""} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div>
            <h1 className="text-3xl font-bold text-[hsl(0,0%,10%)] mb-2">{producto.name}</h1>
            <p className="text-sm text-[hsl(0,0%,55%)] mb-4">
              {categoria.name} › {subcategoria.name}
            </p>

            {producto.shortDesc && (
              <p className="text-[hsl(0,0%,35%)] mb-6 leading-relaxed">{producto.shortDesc}</p>
            )}

            {producto.htmlContent && (
              <div
                className="prose prose-sm max-w-none text-[hsl(0,0%,30%)] mb-8"
                dangerouslySetInnerHTML={{ __html: producto.htmlContent }}
              />
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.slug as string

  const [producto, shared] = await Promise.all([
    productoRepository.findBySlug(slug),
    getSharedProps(),
  ])

  if (!producto) return { notFound: true }

  return {
    props: {
      producto: JSON.parse(JSON.stringify(producto)),
      whatsappContext: {
        categoria:    producto.subcategoria?.categoria?.name,
        subcategoria: producto.subcategoria?.name,
        producto:     producto.name,
      },
      ...shared,
    },
  }
}
