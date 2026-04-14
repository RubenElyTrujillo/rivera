export interface INavItem {
  id: number
  label: string
  href: string
  slug: string | null
  coverImage: string | null
  description: string | null
  order: number
  visible: boolean
  parentId: number | null
  children?: INavItem[]
}
