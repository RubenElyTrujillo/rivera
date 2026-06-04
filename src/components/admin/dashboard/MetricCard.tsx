import * as React from "react";
import {
  Package,
  Grid2x2,
  Image as ImageIcon,
  Layers,
  FileText,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
} from "lucide-react";

export type MetricCardIcon = "Package" | "Grid2x2" | "Image" | "Layers" | "FileText" | "Users" | "Clock" | "ImageIcon";

export interface MetricCardTrend {
  value: number;
  direction: "up" | "down";
  label?: string;
}

export interface MetricCardProps {
  label: string;
  value: number | string;
  icon: MetricCardIcon;
  trend?: MetricCardTrend;
}

const iconMap = {
  Package,
  Grid2x2,
  Image: ImageIcon,
  ImageIcon,
  Layers,
  FileText,
  Users,
  Clock,
};

export function MetricCard({ label, value, icon, trend }: MetricCardProps) {
  const Icon = iconMap[icon];
  const displayValue = typeof value === "string" ? value : value;

  return (
    <div className="bg-white border border-[hsl(0,0%,88%)] rounded-lg p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-[hsl(0,0%,45%)]">{label}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(0,0%,95%)]">
          <Icon size={18} className="text-[hsl(0,0%,45%)]" />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className={`font-bold text-[hsl(0,0%,13%)] ${typeof value === "number" ? "text-3xl" : "text-2xl"}`}>
          {displayValue}
        </span>
        {trend && (
          <div className="flex items-center gap-1">
            {trend.direction === "up" ? (
              <TrendingUp size={14} className="text-emerald-600" />
            ) : (
              <TrendingDown size={14} className="text-red-600" />
            )}
            <span
              className={`text-sm font-medium ${
                trend.direction === "up" ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {trend.direction === "up" ? "+" : "-"}
              {trend.value}%
            </span>
          </div>
        )}
      </div>
      {trend?.label && (
        <span className="text-xs text-[hsl(0,0%,55%)]">{trend.label}</span>
      )}
    </div>
  );
}
