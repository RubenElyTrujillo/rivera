import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GuidedFlowStepper } from "@/components/admin/guided-flows/GuidedFlowStepper";
import { useGuidedFlow } from "@/hooks/admin/useGuidedFlow";
import { useState } from "react";

// Test wrapper that combines GuidedFlowStepper with useGuidedFlow
function TestWrapper({
  steps,
  onSave,
}: {
  steps: { label: string; description?: string }[];
  onSave?: () => Promise<void>;
}) {
  const { currentStep, isFirstStep, isLastStep, onNext, onBack } = useGuidedFlow(steps);
  const [content, setContent] = useState<string>("");

  return (
    <div>
      <GuidedFlowStepper
        steps={steps}
        currentStep={currentStep}
        onNext={onNext}
        onBack={onBack}
        onSave={onSave}
        isSaving={false}
      >
        <div data-testid="step-content">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Content for step ${currentStep}`}
          />
          <p>Step content: {steps[currentStep]?.label}</p>
        </div>
      </GuidedFlowStepper>
    </div>
  );
}

describe("GuidedFlowStepper", () => {
  const mockSteps = [
    { label: "Step 1", description: "First step" },
    { label: "Step 2", description: "Second step" },
    { label: "Step 3", description: "Third step" },
  ];

  it("renders with initial step", () => {
    render(<TestWrapper steps={mockSteps} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("First step")).toBeInTheDocument();
  });

  it("navigates to next step when Siguiente is clicked", async () => {
    render(<TestWrapper steps={mockSteps} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => {
      expect(screen.getByText("Step 2")).toBeInTheDocument();
    });
  });

  it("navigates back when Anterior is clicked", async () => {
    render(<TestWrapper steps={mockSteps} />);

    // Go to step 2 first
    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));
    await waitFor(() => {
      expect(screen.getByText("Step 2")).toBeInTheDocument();
    });

    // Go back
    fireEvent.click(screen.getByRole("button", { name: /anterior/i }));

    await waitFor(() => {
      expect(screen.getByText("Step 1")).toBeInTheDocument();
    });
  });

  it("disables Anterior button on first step", () => {
    render(<TestWrapper steps={mockSteps} />);

    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("renders step content that changes with step", async () => {
    render(<TestWrapper steps={mockSteps} />);

    expect(screen.getByText("Step content: Step 1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    await waitFor(() => {
      expect(screen.getByText("Step content: Step 2")).toBeInTheDocument();
    });
  });

  it("does not navigate before first step when Anterior is clicked", () => {
    render(<TestWrapper steps={mockSteps} />);

    // Try to go back (should stay on step 1)
    fireEvent.click(screen.getByRole("button", { name: /anterior/i }));

    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });

  it("renders step indicators with correct labels", () => {
    render(<TestWrapper steps={mockSteps} />);

    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("Step 3")).toBeInTheDocument();
  });
});
