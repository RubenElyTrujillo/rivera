import { useWhatsApp } from "@/hooks/useWhatsApp"
import type { WhatsAppContext } from "@/hooks/useWhatsApp"

interface WhatsAppFABProps {
  phone: string
  context?: WhatsAppContext
}

/**
 * Floating WhatsApp button fixed to the right edge of the screen
 * at vertical center. Only renders when phone is non-empty.
 */
export default function WhatsAppFAB({ phone, context }: WhatsAppFABProps) {
  const { url } = useWhatsApp(phone, context)

  if (!phone) return null

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar por WhatsApp"
      className="
        fixed right-5 top-1/2 -translate-y-1/2 z-50
        flex items-center justify-center
        w-14 h-14 rounded-full
        bg-[#25D366] hover:bg-[#1ebe5d]
        shadow-lg hover:shadow-[0_4px_20px_rgba(37,211,102,0.5)]
        transition-all duration-300
        group
      "
    >
      {/* WhatsApp SVG icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="w-7 h-7"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.126 1.533 5.862L.057 23.997l6.305-1.653A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-4.998-1.366l-.358-.213-3.742.981.999-3.648-.234-.374A9.818 9.818 0 012.182 12C2.182 6.57 6.57 2.182 12 2.182c5.43 0 9.818 4.388 9.818 9.818 0 5.43-4.388 9.818-9.818 9.818z" />
      </svg>

      {/* Tooltip */}
      <span
        className="
          absolute right-16 whitespace-nowrap
          bg-foreground text-background
          text-xs font-semibold tracking-wide
          px-3 py-1.5
          opacity-0 group-hover:opacity-100
          translate-x-2 group-hover:translate-x-0
          transition-all duration-200
          pointer-events-none
        "
      >
        ¡Cotiza por WhatsApp!
      </span>
    </a>
  )
}
