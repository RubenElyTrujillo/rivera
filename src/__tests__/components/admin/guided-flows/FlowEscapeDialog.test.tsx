import { render, screen, fireEvent } from "@testing-library/react";
import { FlowEscapeDialog } from "@/components/admin/guided-flows/FlowEscapeDialog";

describe("FlowEscapeDialog", () => {
  it("renders dialog when open", () => {
    render(
      <FlowEscapeDialog
        open={true}
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(screen.getByText("¿Abandonar flujo?")).toBeInTheDocument();
    expect(
      screen.getByText("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?")
    ).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <FlowEscapeDialog
        open={false}
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
      />
    );
    expect(screen.queryByText("¿Abandonar flujo?")).not.toBeInTheDocument();
  });

  it("calls onConfirm when Salir button is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <FlowEscapeDialog
        open={true}
        onOpenChange={jest.fn()}
        onConfirm={onConfirm}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Salir" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange with false when Continuar is clicked", () => {
    const onOpenChange = jest.fn();
    render(
      <FlowEscapeDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={jest.fn()}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("renders with custom title and description", () => {
    render(
      <FlowEscapeDialog
        open={true}
        onOpenChange={jest.fn()}
        onConfirm={jest.fn()}
        title="Custom Title"
        description="Custom description text"
      />
    );
    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description text")).toBeInTheDocument();
  });
});
