import { render, screen, fireEvent } from "@testing-library/react";
import { StepNavigation } from "@/components/admin/stepper/StepNavigation";

describe("StepNavigation", () => {
  const defaultProps = {
    onNext: jest.fn(),
    onBack: jest.fn(),
    onSave: jest.fn(),
    isSaving: false,
    isFirstStep: true,
    isLastStep: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Previous and Save buttons", () => {
    render(<StepNavigation {...defaultProps} />);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /guardar/i })).toBeInTheDocument();
  });

  it("renders Next button when not last step", () => {
    render(<StepNavigation {...defaultProps} />);
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
  });

  it("calls onBack when Previous is clicked", () => {
    render(<StepNavigation {...defaultProps} isFirstStep={false} />);
    fireEvent.click(screen.getByRole("button", { name: /anterior/i }));
    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when Next is clicked", () => {
    render(<StepNavigation {...defaultProps} isLastStep={false} />);
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    expect(defaultProps.onNext).toHaveBeenCalledTimes(1);
  });

  it("calls onSave when Guardar is clicked", () => {
    render(<StepNavigation {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
    expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
  });

  it("disables Previous on first step", () => {
    render(<StepNavigation {...defaultProps} isFirstStep={true} />);
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("shows Finalizar instead of Next on last step", () => {
    render(<StepNavigation {...defaultProps} isLastStep={true} />);
    expect(screen.getByRole("button", { name: /finalizar/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /siguiente/i })).not.toBeInTheDocument();
  });

  it("shows Guardando... text when isSaving is true", () => {
    render(<StepNavigation {...defaultProps} isSaving={true} />);
    expect(screen.getByText(/guardando/i)).toBeInTheDocument();
  });

  it("disables all buttons when isSaving is true", () => {
    render(<StepNavigation {...defaultProps} isSaving={true} />);
    expect(screen.getByRole("button", { name: /guardando/i })).toBeDisabled();
  });
});
