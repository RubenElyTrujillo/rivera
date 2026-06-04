import { render, screen, fireEvent } from "@testing-library/react";
import { Stepper } from "@/components/admin/stepper/Stepper";

describe("Stepper", () => {
  const mockSteps = [
    { label: "Paso 1", description: "Información básica" },
    { label: "Paso 2", description: "Detalles" },
    { label: "Paso 3", description: "Revisar" },
  ];

  const defaultProps = {
    steps: mockSteps,
    currentStep: 0,
    onNext: jest.fn(),
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all step labels", () => {
    render(<Stepper {...defaultProps}>Content</Stepper>);
    expect(screen.getByText("Paso 1")).toBeInTheDocument();
    expect(screen.getByText("Paso 2")).toBeInTheDocument();
    expect(screen.getByText("Paso 3")).toBeInTheDocument();
  });

  it("renders current step content", () => {
    render(<Stepper {...defaultProps}>Contenido del paso</Stepper>);
    expect(screen.getByText("Contenido del paso")).toBeInTheDocument();
  });

  it("highlights current step indicator", () => {
    render(<Stepper {...defaultProps} currentStep={1}>Content</Stepper>);
    const indicators = screen.getAllByRole("listitem");
    expect(indicators[1]).toHaveClass("stepper-step--active");
  });

  it("calls onNext when next button is clicked", () => {
    render(<Stepper {...defaultProps}>Content</Stepper>);
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onBack when back button is clicked", () => {
    render(<Stepper {...defaultProps} currentStep={1}>Content</Stepper>);
    fireEvent.click(screen.getByRole("button", { name: /anterior/i }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("disables back button on first step", () => {
    render(<Stepper {...defaultProps} currentStep={0}>Content</Stepper>);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("disables next button on last step", () => {
    render(<Stepper {...defaultProps} currentStep={2}>Content</Stepper>);
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeDisabled();
  });
});
