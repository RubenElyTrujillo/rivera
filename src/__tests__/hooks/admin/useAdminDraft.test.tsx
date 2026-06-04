import { useState } from "react";
import { render, act } from "@testing-library/react";
import { useAdminDraft } from "@/hooks/admin/useAdminDraft";

describe("useAdminDraft", () => {
  const DRAFT_KEY = "admin-draft:test";

  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with empty draft when no localStorage data", () => {
    const { result } = renderHookWithDraft({ key: DRAFT_KEY });
    expect(result.current.draft).toEqual({});
    expect(result.current.hasDraft).toBe(false);
  });

  it("initializes with stored draft from localStorage", () => {
    const storedDraft = { name: "Test Product", price: 100 };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(storedDraft));
    const { result } = renderHookWithDraft({ key: DRAFT_KEY });
    expect(result.current.draft).toEqual(storedDraft);
    expect(result.current.hasDraft).toBe(true);
  });

  it("updates draft with partial data", () => {
    const { result, rerender } = renderHookWithDraft<{ name: string }>({ key: DRAFT_KEY });
    act(() => {
      result.current.updateDraft({ name: "Updated Name" });
    });
    rerender();
    expect((result.current.draft as { name: string }).name).toBe("Updated Name");
  });

  it("saves draft to localStorage on update", () => {
    const { result, rerender } = renderHookWithDraft({ key: DRAFT_KEY });
    act(() => {
      result.current.updateDraft({ name: "Test" });
    });
    rerender();
    const stored = localStorage.getItem(DRAFT_KEY);
    expect(stored).toEqual(expect.stringContaining("Test"));
  });

  it("clears draft from localStorage", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: "Test" }));
    const { result, rerender } = renderHookWithDraft({ key: DRAFT_KEY });
    act(() => {
      result.current.clearDraft();
    });
    rerender();
    expect(localStorage.getItem(DRAFT_KEY)).toBeNull();
    expect(result.current.hasDraft).toBe(false);
  });

  it("returns hasDraft true when stored data exists", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ name: "Test" }));
    const { result } = renderHookWithDraft({ key: DRAFT_KEY });
    expect(result.current.hasDraft).toBe(true);
  });
});

// Helper to render hook with localStorage
function renderHookWithDraft<T extends object>({ key }: { key: string }) {
  let value: ReturnType<typeof useAdminDraft<T>>;
  function TestComponent() {
    const [, setCount] = useState(0);
    value = useAdminDraft<T>(key, {} as T);
    return null;
  }
  const utils = render(<TestComponent />);

  return {
    result: {
      get current() {
        return value as ReturnType<typeof useAdminDraft<T>>;
      },
    },
    rerender: () => {
      act(() => {
        utils.rerender(<TestComponent />);
      });
    },
    unmount: utils.unmount,
  };
}
