"use client";
import { useEffect, useState } from "react";

export type LinkValue =
  | { type: "none" }
  | { type: "internal"; href: string }
  | { type: "external"; href: string };

interface LinkTarget {
  label: string;
  href: string;
  group: string;
}

interface LinkPickerProps {
  value: LinkValue;
  onChange: (v: LinkValue) => void;
  allowNone?: boolean;
}

export default function LinkPicker({ value, onChange, allowNone = true }: LinkPickerProps) {
  const [targets, setTargets] = useState<LinkTarget[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch("/api/admin/link-targets")
      .then((r) => (r.ok ? r.json() : []))
      .then((data: LinkTarget[]) => { if (!cancelled) setTargets(data); })
      .catch(() => { if (!cancelled) setTargets([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-2">
      <div className="flex gap-3 text-sm">
        {allowNone && (
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              checked={value.type === "none"}
              onChange={() => onChange({ type: "none" })}
            />
            <span>Sin enlace</span>
          </label>
        )}
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={value.type === "internal"}
            onChange={() => onChange({ type: "internal", href: value.type === "internal" ? value.href : "" })}
          />
          <span>Página interna</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="radio"
            checked={value.type === "external"}
            onChange={() => onChange({ type: "external", href: value.type === "external" ? value.href : "" })}
          />
          <span>URL externa</span>
        </label>
      </div>

      {value.type === "internal" && (
        <select
          value={value.href}
          onChange={(e) => onChange({ type: "internal", href: e.target.value })}
          className="w-full px-3 py-2 border border-[hsl(0,0%,80%)] rounded-md text-sm bg-white"
        >
          <option value="">{loading ? "Cargando…" : "— Elige un destino —"}</option>
          {targets.map((t) => (
            <option key={`${t.group}-${t.href}`} value={t.href}>{t.label}</option>
          ))}
        </select>
      )}

      {value.type === "external" && (
        <input
          type="url"
          value={value.href}
          onChange={(e) => onChange({ type: "external", href: e.target.value })}
          placeholder="https://ejemplo.com"
          className="w-full px-3 py-2 border border-[hsl(0,0%,80%)] rounded-md text-sm"
        />
      )}
    </div>
  );
}

export function serializeLinkValue(v: LinkValue): { linkType: string; linkHref: string | null } {
  if (v.type === "none") return { linkType: "none", linkHref: null };
  return { linkType: v.type, linkHref: v.href };
}

export function deserializeLinkValue(linkType: string, linkHref: string | null): LinkValue {
  if (linkType === "internal" && linkHref) return { type: "internal", href: linkHref };
  if (linkType === "external" && linkHref) return { type: "external", href: linkHref };
  return { type: "none" };
}
