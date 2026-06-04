import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ActionCard } from "@/components/admin/dashboard/ActionCard";

describe("ActionCard", () => {
  it("renders title and description", () => {
    render(
      <ActionCard
        title="Agregar Producto"
        description="Crea un nuevo producto en el catálogo"
        href="/admin/productos/nuevo"
        icon="Package"
      />
    );
    expect(screen.getByText("Agregar Producto")).toBeInTheDocument();
    expect(screen.getByText("Crea un nuevo producto en el catálogo")).toBeInTheDocument();
  });

  it("renders with default primary color", () => {
    render(
      <ActionCard
        title="Test"
        description="Description"
        href="/admin/test"
        icon="Package"
      />
    );
    const card = screen.getByRole("link");
    expect(card).toHaveClass("bg-[hsl(20,60%,45%)]");
  });

  it("renders with custom color when provided", () => {
    render(
      <ActionCard
        title="Test"
        description="Description"
        href="/admin/test"
        icon="Package"
        color="blue"
      />
    );
    const card = screen.getByRole("link");
    expect(card).toHaveClass("bg-blue-600");
  });

  it("is clickable and navigates to href", () => {
    render(
      <ActionCard
        title="Ir a Productos"
        description="Gestiona productos"
        href="/admin/productos"
        icon="Package"
      />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/productos");
  });

  it("renders icon when provided", () => {
    render(
      <ActionCard
        title="Test"
        description="Description"
        href="/admin/test"
        icon="Package"
      />
    );
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});
