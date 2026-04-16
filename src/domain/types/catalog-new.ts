export interface ICategoria {
  id: number
  name: string
  slug: string
  coverImage: string | null
  description: string | null
  gridCols: number
  cardAspect: string
  _count?: { subcategorias: number }
}

export interface ISubcategoria {
  id: number
  categoriaId: number
  name: string
  slug: string
  coverImage: string | null
  bannerImage: string | null
  description: string | null
  gridCols: number
  cardAspect: string
  categoria?: Pick<ICategoria, "id" | "name" | "slug">
  _count?: { productos: number }
}

export interface IProducto {
  id: number
  subcategoriaId: number
  name: string
  slug: string
  coverImage: string | null
  hoverImage: string | null
  shortDesc: string | null
  htmlContent: string | null
  subcategoria?: Pick<ISubcategoria, "id" | "name" | "slug"> & {
    categoria?: Pick<ICategoria, "id" | "name" | "slug">
  }
  imagenes?: IProductoImagen[]
}

export interface IProductoImagen {
  id: number
  productoId: number
  url: string
  caption: string | null
  order: number
}

export interface IProyecto {
  id: number
  title: string
  slug: string
  city: string
  colonia: string
  description: string
  htmlContent: string | null
  coverImage: string | null
  featured: boolean
  order: number
  visible: boolean
  ambientes: string[]
  area: number | null
  subcategoriaId: number | null
  materialLabel: string | null
  createdAt: Date
  subcategoria?: Pick<ISubcategoria, "id" | "name" | "slug"> | null
  imagenes?: IProyectoImagen[]
}

export interface IProyectoImagen {
  id: number
  proyectoId: number
  url: string
  caption: string | null
  order: number
}
