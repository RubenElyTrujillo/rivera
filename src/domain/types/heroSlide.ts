/**
 * A single slide in the hero carousel.
 * Stored as JSON array inside `PageSection.config` for type=HERO.
 */
export interface IHeroSlide {
  titleLine1: string
  titleLine2: string
  subtitle: string
  description: string
  imageUrl: string
}

/**
 * Shape of the JSON parsed from PageSection.config when type = "HERO".
 */
export interface HeroPageConfig {
  slides: IHeroSlide[]
  autoPlayMs?: number
}
