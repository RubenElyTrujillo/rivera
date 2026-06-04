import { render, act } from "@testing-library/react";
import { useGuidedFlow } from "@/hooks/admin/useGuidedFlow";
import { useState, Dispatch, SetStateAction } from "react";

// Helper to render hooks for testing with proper re-render
function renderHook<T>(callback: () => T) {
  let value: T;
  let setUpdateCount: Dispatch<SetStateAction<number>> = () => {};
  function TestComponent() {
    const [, setUpdateCountLocal] = useState(0);
    setUpdateCount = setUpdateCountLocal;
    value = callback();
    return null;
  }
  const utils = render(<TestComponent />);

  return {
    result: {
      get current() {
        return value as T;
      },
    },
    rerender: () => {
      act(() => {
        setUpdateCount((c: number) => c + 1);
      });
    },
    unmount: utils.unmount,
  };
}

describe("useGuidedFlow", () => {
  const mockSteps = [
    { label: "Paso 1" },
    { label: "Paso 2" },
    { label: "Paso 3" },
  ];

  it("initializes with step 0", () => {
    const { result } = renderHook(() => useGuidedFlow(mockSteps));
    expect(result.current.currentStep).toBe(0);
  });

  it("initializes with given steps", () => {
    const { result } = renderHook(() => useGuidedFlow(mockSteps));
    expect(result.current.steps).toHaveLength(3);
  });

  it("advances to next step", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    act(() => {
      result.current.onNext();
    });
    rerender();
    expect(result.current.currentStep).toBe(1);
  });

  it("goes back to previous step", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    act(() => {
      result.current.onNext();
    });
    rerender();
    act(() => {
      result.current.onBack();
    });
    rerender();
    expect(result.current.currentStep).toBe(0);
  });

  it("does not advance beyond last step", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    act(() => {
      result.current.onNext();
    });
    rerender();
    act(() => {
      result.current.onNext();
    });
    rerender();
    act(() => {
      result.current.onNext();
    });
    rerender();
    expect(result.current.currentStep).toBe(2);
  });

  it("does not go below step 0", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    act(() => {
      result.current.onBack();
    });
    rerender();
    expect(result.current.currentStep).toBe(0);
  });

  it("calculates isFirstStep correctly", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    expect(result.current.isFirstStep).toBe(true);
    act(() => {
      result.current.onNext();
    });
    rerender();
    expect(result.current.isFirstStep).toBe(false);
  });

  it("calculates isLastStep correctly", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    expect(result.current.isLastStep).toBe(false);
    act(() => {
      result.current.onNext();
    });
    rerender();
    act(() => {
      result.current.onNext();
    });
    rerender();
    expect(result.current.isLastStep).toBe(true);
  });

  it("resets to first step", () => {
    const { result, rerender } = renderHook(() => useGuidedFlow(mockSteps));
    act(() => {
      result.current.onNext();
    });
    rerender();
    act(() => {
      result.current.onNext();
    });
    rerender();
    act(() => {
      result.current.reset();
    });
    rerender();
    expect(result.current.currentStep).toBe(0);
  });
});
