import { useWhatsApp } from "@/hooks/useWhatsApp"

describe("useWhatsApp", () => {
  const PHONE = "525629671869"

  it("returns a wa.me URL with the phone number", () => {
    const { url } = useWhatsApp(PHONE)
    expect(url).toContain("https://wa.me/525629671869")
  })

  it("encodes a generic message when no context given", () => {
    const { url } = useWhatsApp(PHONE)
    expect(url).toContain("text=")
    expect(url).toContain("informaci%C3%B3n")
  })

  it("builds material-only message", () => {
    const { url } = useWhatsApp(PHONE, { material: "Pisos Laminados" })
    expect(url).toContain("Pisos%20Laminados")
    expect(url).toContain("informaci%C3%B3n")
  })

  it("builds material+collection message", () => {
    const { url } = useWhatsApp(PHONE, { material: "Pisos Laminados", collection: "Splash!" })
    expect(url).toContain("Pisos%20Laminados")
    expect(url).toContain("Splash!")
    expect(url).toContain("disponibilidad")
  })

  it("builds product message with code", () => {
    const { url } = useWhatsApp(PHONE, {
      material: "Pisos Laminados",
      collection: "Splash!",
      product: "Clásico",
      code: "SPLASH-CL-01",
    })
    expect(url).toContain("Cl%C3%A1sico")
    expect(url).toContain("SPLASH-CL-01")
    expect(url).toContain("Pisos%20Laminados")
  })

  it("returns '#' when phone is empty", () => {
    const { url } = useWhatsApp("")
    expect(url).toBe("#")
  })
})
