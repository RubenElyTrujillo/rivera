import { navItemRepository } from "@/repositories/navItem.repository"
import { db } from "@/infrastructure/db/client"

/**
 * Retorna props comunes que todas las páginas públicas necesitan:
 * navItems para el navbar y whatsappPhone para el FAB de WhatsApp.
 */
export async function getSharedProps() {
  const [navItems, contact] = await Promise.all([
    navItemRepository.findRoots(),
    db.contactInfo.findFirst(),
  ])

  return {
    navItems,
    whatsappPhone: contact?.whatsappPhone ?? "",
  }
}
