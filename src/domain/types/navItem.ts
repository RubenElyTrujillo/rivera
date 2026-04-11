export interface INavItem {
  id: number
  label: string
  href: string
  order: number
  visible: boolean
  parentId: number | null
  children?: INavItem[]
}
