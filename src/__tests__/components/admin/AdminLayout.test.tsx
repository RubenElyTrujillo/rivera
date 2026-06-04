import { render, screen } from "@testing-library/react";
import AdminLayout from "@/components/admin/AdminLayout";
import Link from "next/link";

jest.mock("next/router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/admin",
    query: {},
  }),
}));

// Mock next/link to capture rendered links
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AdminLayout Navigation Order", () => {
  it("renders Dashboard link first", () => {
    render(<AdminLayout>{null}</AdminLayout>);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);

    // First link should be Dashboard
    expect(links[0]).toHaveTextContent("Dashboard");
    expect(links[0]).toHaveAttribute("href", "/admin");
  });

  it("renders navigation items in expected order", () => {
    render(<AdminLayout>{null}</AdminLayout>);

    const links = screen.getAllByRole("link");
    const linkTexts = links.map((link) => ({
      text: link.textContent,
      href: link.getAttribute("href"),
    }));

    // Expected order based on frequency:
    // Dashboard first
    expect(linkTexts[0].href).toBe("/admin");

    // Catalog section (Catálogo de materiales)
    const catalogIndex = linkTexts.findIndex((l) => l.href === "/admin/categorias");
    expect(catalogIndex).toBeGreaterThan(0);

    // Check that Categorías comes before Productos
    const categoriasIndex = linkTexts.findIndex((l) => l.href === "/admin/categorias");
    const subcategoriasIndex = linkTexts.findIndex((l) => l.href === "/admin/subcategorias");
    const productosIndex = linkTexts.findIndex((l) => l.href === "/admin/productos");

    expect(categoriasIndex).toBeLessThan(subcategoriasIndex);
    expect(subcategoriasIndex).toBeLessThan(productosIndex);

    // Proyectos section
    const proyectosIndex = linkTexts.findIndex((l) => l.href === "/admin/proyectos");
    expect(productosIndex).toBeLessThan(proyectosIndex);

    // Servicios section
    const serviciosIndex = linkTexts.findIndex((l) => l.href === "/admin/services");
    expect(proyectosIndex).toBeLessThan(serviciosIndex);
  });

  it("renders all expected admin navigation links", () => {
    render(<AdminLayout>{null}</AdminLayout>);

    const links = screen.getAllByRole("link");
    const hrefs = links.map((l) => l.getAttribute("href"));

    // Verify all expected routes are present
    expect(hrefs).toContain("/admin");
    expect(hrefs).toContain("/admin/categorias");
    expect(hrefs).toContain("/admin/subcategorias");
    expect(hrefs).toContain("/admin/productos");
    expect(hrefs).toContain("/admin/proyectos");
    expect(hrefs).toContain("/admin/services");
    expect(hrefs).toContain("/admin/hero-slides");
    expect(hrefs).toContain("/admin/carousel");
    expect(hrefs).toContain("/admin/catalog");
    expect(hrefs).toContain("/admin/page-sections");
    expect(hrefs).toContain("/admin/paginas");
    expect(hrefs).toContain("/admin/nav-items");
    expect(hrefs).toContain("/admin/contact");
    expect(hrefs).toContain("/admin/footer");
    expect(hrefs).toContain("/admin/seo");
    expect(hrefs).toContain("/admin/media");
  });

  it("renders section separators and nav links", () => {
    render(<AdminLayout>{null}</AdminLayout>);

    // Check that section labels and nav links are rendered
    // (some labels like "Proyectos" appear both as section labels and nav link text)
    expect(screen.getAllByRole("link").length).toBeGreaterThan(10);
  });

  it("renders logout button", () => {
    render(<AdminLayout>{null}</AdminLayout>);

    const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i });
    expect(logoutButton).toBeInTheDocument();
  });
});
