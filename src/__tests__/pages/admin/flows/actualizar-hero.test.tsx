import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ActualizarHeroFlow from "@/pages/admin/flows/actualizar-hero";

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    query: {},
  }),
}));

jest.mock("@/hooks/admin/useAdminAuth", () => ({
  useAdminAuth: () => ({ checking: false }),
}));

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("ActualizarHeroFlow", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Mock for hero slides fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        {
          id: "1",
          titleLine1: "Bienvenido",
          titleLine2: "a Rivera",
          subtitle: "Calidad y diseño",
          description: "Descripción del hero",
          imageUrl: "",
          textAlign: "center",
        },
      ]),
    } as unknown as Response);
  });

  it("renders the flow with FlowProgress showing step 1", async () => {
    render(<ActualizarHeroFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });
    expect(screen.getByText("de")).toBeInTheDocument();
    // Check total steps - just verify the element exists
    const stepLabels = screen.getAllByText("5");
    expect(stepLabels.length).toBeGreaterThan(0);
  });

  it("renders all 5 step labels in the stepper", async () => {
    render(<ActualizarHeroFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    // Verify all 5 step labels are present
    expect(screen.getByText("Seleccionar slide")).toBeInTheDocument();
    expect(screen.getByText("Editar contenido")).toBeInTheDocument();
    expect(screen.getByText("Cambiar imagen")).toBeInTheDocument();
    expect(screen.getByText("Revisar")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
  });

  it("disables previous button on first step", async () => {
    render(<ActualizarHeroFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("shows Siguiente button enabled on first step", async () => {
    render(<ActualizarHeroFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    const siguienteButton = screen.getByRole("button", { name: /siguiente/i });
    expect(siguienteButton).not.toBeDisabled();
  });
});
