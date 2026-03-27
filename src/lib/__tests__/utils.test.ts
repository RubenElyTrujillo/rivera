import { cn } from "@/lib/utils";

describe("cn (class name utility)", () => {
  it("devuelve una cadena vacía sin argumentos", () => {
    expect(cn()).toBe("");
  });

  it("fusiona clases simples", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("ignora valores falsy (undefined, null, false)", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("resuelve conflictos de Tailwind manteniendo la última clase", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("resuelve conflictos de colores de fondo", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("acepta objetos condicionales de clsx", () => {
    expect(cn({ active: true, disabled: false })).toBe("active");
  });

  it("acepta arrays de clases", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("maneja clases duplicadas sin conflicto fusionando correctamente", () => {
    const result = cn("text-sm font-bold", "font-normal");
    expect(result).toBe("text-sm font-normal");
  });
});
