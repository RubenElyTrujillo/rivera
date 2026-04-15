import type { GetServerSideProps } from "next"
import Head from "next/head"
import Link from "next/link"
import { categoriaRepository } from "@/repositories/categoria.repository"
import { getSharedProps } from "@/lib/getSharedProps"
import type { ICategoria, ISubcategoria, INavItem } from "@/domain/types"

interface Props {
  categoria: ICategoria & { subcategorias: (ISubcategoria & { _count: { productos: number } })[] }
  navItems: INavItem[]
  whatsappPhone: string
}

export default function CategoriaPage({ categoria }: Props) {
  return (
    <>
      <Head>
        <title>{categoria.name} — Rivera</title>
        <meta name="description" content={categoria.description ?? `Explora ${categoria.name} en Rivera`} />
      </Head>

      {/* Hero */}
      <div className="relative w-full h-64 md:h-80 bg-[hsl(0,0%,15%)] overflow-hidden">
        {categoria.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={categoria.coverImage}
            alt={categoria.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
        )}
        <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-12 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{categoria.name}</h1>
          {categoria.description && (
            <p className="mt-3 text-white/80 text-lg max-w-xl">{categoria.description}</p>
          )}
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-4">
        <nav className="text-sm text-[hsl(0,0%,55%)]">
          <Link href="/" className="hover:text-[hsl(20,60%,45%)] transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-[hsl(0,0%,20%)]">{categoria.name}</span>
        </nav>
      </div>

      {/* Subcategorías grid */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 pb-16">
        {categoria.subcategorias.length === 0 ? (
          <p className="text-[hsl(0,0%,55%)] text-center py-12">Próximamente…</p>
        ) : (
          <div className={`grid gap-6 ${
            categoria.gridCols === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : categoria.gridCols === 3
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}>
            {categoria.subcategorias.map(sub => (
              <Link
                key={sub.id}
                href={`/${categoria.slug}/${sub.slug}`}
                className="group block rounded-xl overflow-hidden border border-[hsl(0,0%,90%)] hover:shadow-lg transition-all duration-300"
              >
                <div className={`overflow-hidden ${
                  categoria.cardAspect === "paisaje" ? "aspect-[4/3]"
                  : categoria.cardAspect === "retrato" ? "aspect-[3/4]"
                  : "aspect-square"
                } bg-[hsl(0,0%,90%)]`}>
                  {sub.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sub.coverImage}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[hsl(20,30%,85%)] to-[hsl(20,20%,75%)]" />
                  )}
                </div>
                <div className="p-4 text-center">
                  <h2 className="font-semibold text-[hsl(0,0%,13%)] group-hover:text-[hsl(20,60%,45%)] transition-colors">
                    {sub.name}
                  </h2>
                  <p className="text-xs text-[hsl(0,0%,55%)] mt-1">
                    {sub._count.productos} producto{sub._count.productos !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const slug = ctx.params?.categoriaSlug as string
  const [categoria, shared] = await Promise.all([
    categoriaRepository.findBySlug(slug),
    getSharedProps(),
  ])

  if (!categoria) return { notFound: true }

  return {
    props: {
      categoria: JSON.parse(JSON.stringify(categoria)),
      ...shared,
    },
  }
}
