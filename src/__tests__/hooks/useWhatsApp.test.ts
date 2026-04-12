import { buildWhatsAppUrl } from "@/hooks/useWhatsApp"

describe("buildWhatsAppUrl", () => {
  const PHONE = "525629671869"

  it("returns a wa.me URL with the phone number", () => {
    const { url } = buildWhatsAppUrl(PHONE)
    expect(url).toContain("https://wa.me/525629671869")
  })

  it("encodes a generic message when no context given", () => {
    const { url } = buildWhatsAppUrl(PHONE)
    expect(url).toContain("text=")
    expect(url).toContain("informaci%C3%B3n")
  })

  it("builds material-only message", () => {
    const { url } = buildWhatsAppUrl(PHONE, { material: "Pisos Laminados" })
    expect(url).toContain("Pisos%20Laminados")
    expect(decodeURIComponent(url)).toContain("Me dan más información")
  })

  it("builds material+collection message", () => {
    const { url } = buildWhatsAppUrl(PHONE, { material: "Pisos Laminados", collection: "Splash!" })
    expect(url).toContain("Pisos%20Laminados")
    expect(url).toContain("Splash!")
    expect(url).toContain("disponibilidad")
  })

  it("builds product message with code", () => {
    const { url } = buildWhatsAppUrl(PHONE, {
      material: "Pisos Laminados",
      collection: "Splash!",
      product: "Clásico",
      code: "SPLASH-CL-01",
    })
    const decoded = decodeURIComponent(url.split("text=")[1])
    expect(decoded).toBe(
      "Hola, me interesa el producto: Clásico (SPLASH-CL-01) de Pisos Laminados — Splash!. ¿Precio y disponibilidad?"
    )
  })

  it("returns '#' when phone is empty", () => {
    const { url } = buildWhatsAppUrl("")
    expect(url).toBe("#")
  })

  it("returns generic message when context has no fields set", () => {
    const { url } = buildWhatsAppUrl(PHONE, {})
    expect(decodeURIComponent(url)).toContain("obtener más información")
  })
})
