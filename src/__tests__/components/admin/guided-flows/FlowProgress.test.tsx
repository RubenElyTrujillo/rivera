import { render, screen } from "@testing-library/react";
import { FlowProgress } from "@/components/admin/guided-flows/FlowProgress";

describe("FlowProgress", () => {
  it("renders current step and total steps", () => {
    render(<FlowProgress currentStep={0} totalSteps={5} />);
    expect(screen.getByText("Paso 1")).toBeInTheDocument();
    expect(screen.getByText("de")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("displays step 3 of 6 correctly", () => {
    render(<FlowProgress currentStep={2} totalSteps={6} />);
    expect(screen.getByText("Paso 3")).toBeInTheDocument();
    expect(screen.getByText("de")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
  });

  it("uses custom step label when provided", () => {
    render(<FlowProgress currentStep={1} totalSteps={4} stepLabel="Step" />);
    expect(screen.getByText("Step 2")).toBeInTheDocument();
  });

  it("renders with default Paso label", () => {
    render(<FlowProgress currentStep={0} totalSteps={3} />);
    expect(screen.getByText("Paso 1")).toBeInTheDocument();
  });
});
