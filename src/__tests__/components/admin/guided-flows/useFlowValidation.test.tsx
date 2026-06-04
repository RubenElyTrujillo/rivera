import { renderHook, act } from "@testing-library/react";
import { useFlowValidation } from "@/components/admin/guided-flows/useFlowValidation";
import { z } from "zod";

const TestSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Email inválido"),
});

describe("useFlowValidation", () => {
  it("initializes with empty errors object", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    expect(result.current.errors).toEqual({});
  });

  it("validates required field - sets error on empty string", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateField("name", "");
    });
    expect(result.current.errors.name).toBe("El nombre es obligatorio");
  });

  it("validates required field - clears error when valid", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateField("name", "");
    });
    expect(result.current.errors.name).toBeDefined();
    act(() => {
      result.current.validateField("name", "Test");
    });
    expect(result.current.errors.name).toBeUndefined();
  });

  it("validates email format - invalid email", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateField("email", "notanemail");
    });
    expect(result.current.errors.email).toBe("Email inválido");
  });

  it("validates email format - valid email clears error", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateField("email", "invalid");
    });
    expect(result.current.errors.email).toBeDefined();
    act(() => {
      result.current.validateField("email", "test@example.com");
    });
    expect(result.current.errors.email).toBeUndefined();
  });

  it("validates entire form - success case", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateForm({ name: "Test", email: "test@example.com" });
    });
    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  it("validates entire form - returns all errors when invalid", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateForm({ name: "", email: "invalid" });
    });
    expect(result.current.isValid).toBe(false);
    expect(result.current.errors.name).toBe("El nombre es obligatorio");
    expect(result.current.errors.email).toBe("Email inválido");
  });

  it("clears all errors on clearErrors", () => {
    const { result } = renderHook(() => useFlowValidation(TestSchema));
    act(() => {
      result.current.validateForm({ name: "", email: "invalid" });
    });
    expect(result.current.errors.name).toBeDefined();
    act(() => {
      result.current.clearErrors();
    });
    expect(result.current.errors).toEqual({});
  });
});
