export interface ICategoria {
  id: number
  name: string
  slug: string
  coverImage: string | null
  description: string | null
  gridCols: number
  _count?: { subcategorias: number }
}

export interface ISubcategoria {
  id: number
  categoriaId: number
  name: string
  slug: string
  coverImage: string | null
  description: string | null
  gridCols: number
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
