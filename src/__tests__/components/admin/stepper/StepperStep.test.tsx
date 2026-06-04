import { render, screen } from "@testing-library/react";
import { StepperStep } from "@/components/admin/stepper/StepperStep";

describe("StepperStep", () => {
  it("renders children content", () => {
    render(<StepperStep>Contenido del paso</StepperStep>);
    expect(screen.getByText("Contenido del paso")).toBeInTheDocument();
  });

  it("applies hidden class when isActive is false", () => {
    const { container } = render(
      <StepperStep isActive={false}>Hidden content</StepperStep>
    );
    expect(container.firstChild).toHaveClass("hidden");
  });

  it("applies block class when isActive is true", () => {
    const { container } = render(
      <StepperStep isActive={true}>Active content</StepperStep>
    );
    expect(container.firstChild).toHaveClass("block");
  });

  it("renders with correct step number", () => {
    render(<StepperStep stepNumber={3}>Step 3 content</StepperStep>);
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
