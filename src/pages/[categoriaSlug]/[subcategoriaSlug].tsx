import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { subcategoriaRepository } from "@/repositories/subcategoria.repository"
import { getSharedProps } from "@/lib/getSharedProps"
import type { ISubcategoria, IProducto, INavItem } from "@/domain/types"

interface Props {
  subcategoria: ISubcategoria & { productos: IProducto[] }
  navItems: INavItem[]
  whatsappPhone: string
}

export default function SubcategoriaPage({ subcategoria }: Props) {
  const categoria = subcategoria.categoria!

  return (
    <>
      <Head>
        <title>{subcategoria.name} — {categoria.name} — Rivera</title>
        <meta name="description" content={subcategoria.description ?? `Explora ${subcategoria.name} en Rivera`} />
      </Head>

      {/* Hero */}
      <div className="relative w-full h-56 md:h-72 bg-[hsl(0,0%,15%)] overflow-hidden">
        {subcategoria.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={subcategoria.coverImage}
            alt={subcategoria.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{subcategoria.name}</h1>
          {subcategoria.description && (
            <p className="mt-2 text-white/80 max-w-lg">{subcategoria.description}</p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        <nav className="text-sm text-[hsl(0,0%,55%)]">
          <Link href="/" className="hover:text-[hsl(20,60%,45%)] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href={`/${categoria.slug}`} className="hover:text-[hsl(20,60%,45%)] transition-colors">{categoria.name}</Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(0,0%,20%)]">{subcategoria.name}</span>
        </nav>
      </div>

      {/* Productos grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-16">
        {(subcategoria as unknown as { productos: IProducto[] }).productos.length === 0 ? (
          <p className="text-[hsl(0,0%,55%)] text-center py-12">Próximamente…</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(subcategoria as unknown as { productos: IProducto[] }).productos.map(producto => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}

function ProductoCard({ producto }: { producto: IProducto }) {
  return (
    <Link
      href={`/producto/${producto.slug}`}
      className="group block rounded-xl overflow-hidden border border-[hsl(0,0%,90%)] hover:shadow-lg transition-all duration-300"
    >
      {/* Image with hover effect */}
      <div className="aspect-square bg-[hsl(0,0%,90%)] overflow-hidden relative">
        {producto.coverImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={producto.coverImage}
              alt={producto.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
                producto.hoverImage
                  ? "opacity-100 group-hover:opacity-0"
                  : "group-hover:scale-105"
              }`}
            />
            {producto.hoverImage && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={producto.hoverImage}
                alt={`${producto.name} (detalle)`}
                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[hsl(20,30%,85%)] to-[hsl(20,20%,75%)] group-hover:scale-105 transition-transform duration-300" />
        )}
      </div>
      {/* Name */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-[hsl(0,0%,13%)] group-hover:text-[hsl(20,60%,45%)] transition-colors leading-tight">
          {producto.name}
        </h3>
        {producto.shortDesc && (
          <p className="text-xs text-[hsl(0,0%,55%)] mt-1 line-clamp-2">{producto.shortDesc}</p>
        )}
      </div>
    </Link>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const categoriaSlug = ctx.params?.categoriaSlug as string
  const subcategoriaSlug = ctx.params?.subcategoriaSlug as string

  const [subcategoria, shared] = await Promise.all([
    subcategoriaRepository.findBySlug(subcategoriaSlug),
    getSharedProps(),
  ])

  // Verify it belongs to the right categoria slug
  if (!subcategoria || subcategoria.categoria?.slug !== categoriaSlug) {
    return { notFound: true }
  }

  return {
    props: {
      subcategoria: JSON.parse(JSON.stringify(subcategoria)),
      whatsappContext: {
        categoria: subcategoria.categoria?.name,
        subcategoria: subcategoria.name,
      },
      ...shared,
    },
  }
}
