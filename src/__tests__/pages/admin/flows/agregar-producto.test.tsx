import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AgregarProductoFlow from "@/pages/admin/flows/agregar-producto";

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

describe("AgregarProductoFlow", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Mock for categorias fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1, nombre: "Pisos" }]),
    } as unknown as Response);
    // Mock for subcategorias fetch (called when categoriaId is set)
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1, nombre: "Laminados" }]),
    } as unknown as Response);
  });

  it("renders the flow with FlowProgress showing step 1 of 6", async () => {
    render(<AgregarProductoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });
    expect(screen.getByText("de")).toBeInTheDocument();
    // Check total steps indicator
    const stepLabels = screen.getAllByText("6");
    expect(stepLabels.length).toBeGreaterThan(0);
  });

  it("renders step 0 - Categoria selection with Pisos button", async () => {
    render(<AgregarProductoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Selecciona la categoría del producto:")).toBeInTheDocument();
    });

    // Should show Pisos category button
    expect(screen.getByText("Pisos")).toBeInTheDocument();
  });

  it("renders step indicators showing all 6 steps", async () => {
    render(<AgregarProductoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Categoría")).toBeInTheDocument();
    });

    // Verify all 6 step labels are present
    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Subcategoría")).toBeInTheDocument();
    expect(screen.getByText("Datos básicos")).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Imágenes")).toBeInTheDocument();
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("disables previous button on first step", async () => {
    render(<AgregarProductoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("shows Siguiente button enabled on first step", async () => {
    render(<AgregarProductoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    const siguienteButton = screen.getByRole("button", { name: /siguiente/i });
    expect(siguienteButton).not.toBeDisabled();
  });

  it("shows error message when no category is selected", async () => {
    render(<AgregarProductoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Selecciona la categoría del producto:")).toBeInTheDocument();
    });

    expect(screen.getByText("Selecciona una categoría para continuar")).toBeInTheDocument();
  });
});
