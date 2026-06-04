import { useState, useEffect, useCallback } from "react";

export interface UseAdminDraftReturn<T> {
  draft: T;
  updateDraft: (partial: Partial<T>) => void;
  clearDraft: () => void;
  hasDraft: boolean;
}

export function useAdminDraft<T extends object>(
  key: string,
  initialValue: T
): UseAdminDraftReturn<T> {
  const [draft, setDraft] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Ignore parse errors
    }
    return initialValue;
  });

  const updateDraft = useCallback(
    (partial: Partial<T>) => {
      setDraft((prev) => {
        const updated = { ...prev, ...partial };
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(key, JSON.stringify(updated));
          } catch {
            // Ignore storage errors
          }
        }
        return updated;
      });
    },
    [key]
  );

  const clearDraft = useCallback(() => {
    setDraft(initialValue);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore storage errors
      }
    }
  }, [key, initialValue]);

  const hasDraft = draft && Object.keys(draft).length > 0;

  return { draft, updateDraft, clearDraft, hasDraft };
}
