import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "@/pages/admin/index";

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

describe("AdminDashboard", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    // Mock for productos count
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(Array(42).fill({})),
    } as unknown as Response);
    // Mock for subcategorias count
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(Array(12).fill({})),
    } as unknown as Response);
    // Mock for proyectos count
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(Array(8).fill({})),
    } as unknown as Response);
    // Mock for servicios count
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(Array(5).fill({})),
    } as unknown as Response);
  });

  it("renders the dashboard page title", async () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Panel de administración")).toBeInTheDocument();
    expect(screen.getByText("Acciones rápidas")).toBeInTheDocument();
  });

  it("renders ActionCards with quick action links", async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Agregar Producto")).toBeInTheDocument();
    });

    expect(screen.getByText("Agregar Proyecto")).toBeInTheDocument();
    expect(screen.getByText("Actualizar Hero")).toBeInTheDocument();
  });

  it("renders ActionCards with correct descriptions", async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Crear una nueva ficha de producto en el catálogo")).toBeInTheDocument();
    });

    expect(screen.getByText("Registrar un nuevo proyecto en el portfolio")).toBeInTheDocument();
    expect(screen.getByText("Modificar el carrusel principal del sitio")).toBeInTheDocument();
  });

  it("renders the Metricas del sitio section", async () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Métricas del sitio")).toBeInTheDocument();
  });

  it("renders AdminMetrics component", async () => {
    render(<AdminDashboard />);

    // AdminMetrics shows loading then metrics
    await waitFor(() => {
      expect(screen.getByText("Total Productos")).toBeInTheDocument();
    });

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders ActionCards with correct href attributes", async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Agregar Producto")).toBeInTheDocument();
    });

    // Find links by href
    const agregarProductoLink = screen.getByRole("link", { name: /agregar producto/i });
    expect(agregarProductoLink).toHaveAttribute("href", "/admin/flows/agregar-producto");

    const agregarProyectoLink = screen.getByRole("link", { name: /agregar proyecto/i });
    expect(agregarProyectoLink).toHaveAttribute("href", "/admin/flows/agregar-proyecto");

    const actualizarHeroLink = screen.getByRole("link", { name: /actualizar hero/i });
    expect(actualizarHeroLink).toHaveAttribute("href", "/admin/flows/actualizar-hero");
  });
});
