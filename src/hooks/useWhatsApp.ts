import { useMemo } from "react"

export interface WhatsAppContext {
  // Nuevo catálogo
  categoria?: string
  subcategoria?: string
  producto?: string
  // Legacy (se mantiene para compatibilidad)
  material?: string
  collection?: string
  product?: string
  code?: string
}

/**
 * Pure function — builds a `{ url }` object for a WhatsApp deeplink.
 * Exported for direct testing; prefer `useWhatsApp` inside React components.
 */
export function buildWhatsAppUrl(phone: string, context?: WhatsAppContext) {
  const message = buildMessage(context)
  const encoded = encodeURIComponent(message)
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : "#"
  return { url }
}

/**
 * React hook — memoized WhatsApp deeplink builder.
 *
 * @param phone   - E.164 without '+', e.g. "525629671869"
 * @param context - Optional product context to pre-fill the message
 * @returns { url } — ready-to-use `https://wa.me/...` URL
 */
export function useWhatsApp(phone: string, context?: WhatsAppContext) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => buildWhatsAppUrl(phone, context), [phone, context?.material, context?.collection, context?.product, context?.code, context?.producto, context?.subcategoria, context?.categoria])
}

function buildMessage(context?: WhatsAppContext): string {
  if (!context) return "Hola, me gustaría obtener más información. ¿Me pueden ayudar?"

  // Nuevo catálogo
  if (context.producto) {
    const breadcrumb = [context.categoria, context.subcategoria].filter(Boolean).join(" › ")
    return `Hola, me interesa el producto: ${context.producto}${breadcrumb ? ` (${breadcrumb})` : ""}. ¿Precio y disponibilidad?`
  }

  if (context.subcategoria) {
    return `Hola, me interesa la línea: ${context.categoria ? `${context.categoria} › ` : ""}${context.subcategoria}. ¿Me dan más información?`
  }

  // Legacy
  if (context.product && context.code) {
    const line2 = [context.material, context.collection].filter(Boolean).join(" — ")
    return `Hola, me interesa el producto: ${context.product} (${context.code})${line2 ? ` de ${line2}` : ""}. ¿Precio y disponibilidad?`
  }

  if (context.collection && context.material) {
    return `Hola, me interesa: ${context.material} — ${context.collection}. ¿Precios y disponibilidad?`
  }

  if (context.material) {
    return `Hola, me interesa: ${context.material}. ¿Me dan más información?`
  }

  return "Hola, me gustaría obtener más información. ¿Me pueden ayudar?"
}
