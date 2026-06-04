import { useState, useCallback } from "react";
import { ZodSchema, ZodError } from "zod";

export interface FlowValidationReturn<T extends object> {
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  validateField: (field: keyof T, value: unknown) => void;
  validateForm: (data: T) => void;
  clearErrors: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ZodShape<T extends object> = Record<string, ZodSchema<any>>;

export function useFlowValidation<T extends object>(
  schema: ZodSchema<T>
): FlowValidationReturn<T> {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});

  const validateField = useCallback(
    (field: keyof T, value: unknown) => {
      // Access the shape directly - Zod v4 exposes shape as a property
      const shape = (schema as unknown as { shape: ZodShape<T> }).shape;
      const fieldKey = String(field);
      const fieldValidator = shape?.[fieldKey];
      
      if (!fieldValidator) {
        return;
      }

      const result = fieldValidator.safeParse(value);

      if (result.success) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      } else if (result.error instanceof ZodError) {
        // When validating a single field, path is empty [] - use the first issue's message
        const fieldError = result.error.issues.find(
          (issue) => issue.path.length === 0 || issue.path[0] === field
        );
        if (fieldError) {
          setErrors((prev) => ({
            ...prev,
            [field]: fieldError.message,
          }));
        }
      }
    },
    [schema]
  );

  const validateForm = useCallback(
    (data: T) => {
      const result = schema.safeParse(data);
      if (result.success) {
        setErrors({});
      } else if (result.error instanceof ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        for (const issue of result.error.issues) {
          const field = issue.path[0] as keyof T;
          newErrors[field] = issue.message;
        }
        setErrors(newErrors);
      }
    },
    [schema]
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return { errors, isValid, validateField, validateForm, clearErrors };
}
