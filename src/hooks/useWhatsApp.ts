export interface WhatsAppContext {
  material?: string
  collection?: string
  product?: string
  code?: string
}

/**
 * Generates a WhatsApp deeplink URL with an optional context message.
 *
 * @param phone  - E.164 without '+', e.g. "525629671869"
 * @param context - Optional product context to pre-fill the message
 * @returns { url } — ready-to-use `https://wa.me/...` URL
 */
export function useWhatsApp(phone: string, context?: WhatsAppContext) {
  const message = buildMessage(context)
  const encoded = encodeURIComponent(message)
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : "#"
  return { url }
}

function buildMessage(context?: WhatsAppContext): string {
  if (!context) return "Hola, me gustaría obtener más información. ¿Me pueden ayudar?"

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
