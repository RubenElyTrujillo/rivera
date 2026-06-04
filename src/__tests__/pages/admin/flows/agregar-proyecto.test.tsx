import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import AgregarProyectoFlow from "@/pages/admin/flows/agregar-proyecto";

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

describe("AgregarProyectoFlow", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Mock for subcategorias fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1, nombre: "Pisos Laminados" }]),
    } as unknown as Response);
  });

  it("renders the flow with FlowProgress showing step 1", async () => {
    render(<AgregarProyectoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });
    expect(screen.getByText("de")).toBeInTheDocument();
    // Check total steps - just verify the element exists
    const stepLabels = screen.getAllByText("6");
    expect(stepLabels.length).toBeGreaterThan(0);
  });

  it("renders step 0 - Informacion basica with title input", async () => {
    render(<AgregarProyectoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Título del proyecto")).toBeInTheDocument();
    });

    // Should have title and location inputs
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("renders all 6 step labels in the stepper", async () => {
    render(<AgregarProyectoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    // Verify all 6 step labels are present
    expect(screen.getByText("Información básica")).toBeInTheDocument();
    expect(screen.getByText("Detalles")).toBeInTheDocument();
    expect(screen.getByText("Imágenes")).toBeInTheDocument();
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.getByText("Revisar")).toBeInTheDocument();
    expect(screen.getByText("Publicar")).toBeInTheDocument();
  });

  it("disables previous button on first step", async () => {
    render(<AgregarProyectoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("shows Siguiente button enabled on first step", async () => {
    render(<AgregarProyectoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Paso 1")).toBeInTheDocument();
    });

    const siguienteButton = screen.getByRole("button", { name: /siguiente/i });
    expect(siguienteButton).not.toBeDisabled();
  });

  it("allows entering project title", async () => {
    render(<AgregarProyectoFlow />);

    await waitFor(() => {
      expect(screen.getByText("Título del proyecto")).toBeInTheDocument();
    });

    const titleInput = screen.getByPlaceholderText("Instalación en Casa Moderna");
    fireEvent.change(titleInput, { target: { value: "Nuevo Proyecto Test" } });

    expect(titleInput).toHaveValue("Nuevo Proyecto Test");
  });
});
