import { PAGE_SECTION_TYPE_VALUES } from "@/domain/schemas/pageSection.schema"

export type PageSectionType = typeof PAGE_SECTION_TYPE_VALUES[number]

export interface IPageSection {
  id: number
  type: PageSectionType
  order: number
  visible: boolean
  config: string
}
