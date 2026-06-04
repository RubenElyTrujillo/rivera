import * as React from "react";
import Link from "next/link";
import {
  Package,
  Grid2x2,
  Image as ImageIcon,
  Layers,
  Plus,
  FileText,
  Settings,
} from "lucide-react";

export type ActionCardIcon = "Package" | "Grid2x2" | "Image" | "Layers" | "Plus" | "FileText" | "Settings";

export interface ActionCardProps {
  title: string;
  description: string;
  href: string;
  icon: ActionCardIcon;
  color?: "primary" | "blue" | "emerald" | "amber";
}

const iconMap = {
  Package,
  Grid2x2,
  Image: ImageIcon,
  Layers,
  Plus,
  FileText,
  Settings,
};

const colorClasses = {
  primary: "bg-[hsl(20,60%,45%)] hover:bg-[hsl(20,60%,40%)]",
  blue: "bg-blue-600 hover:bg-blue-700",
  emerald: "bg-emerald-600 hover:bg-emerald-700",
  amber: "bg-amber-600 hover:bg-amber-700",
};

export function ActionCard({
  title,
  description,
  href,
  icon,
  color = "primary",
}: ActionCardProps) {
  const Icon = iconMap[icon];

  return (
    <Link
      href={href}
      className={`group relative flex flex-col gap-3 p-6 rounded-xl text-white transition-all duration-200 ${colorClasses[color]} hover:scale-[1.02] hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
          <Icon size={20} />
        </div>
        <svg
          className="h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="mt-1 text-sm text-white/80">{description}</p>
      </div>
    </Link>
  );
}
