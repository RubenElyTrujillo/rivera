"use client";

import { useState } from "react";


interface FinishCardProps {
  finish: { name: string; coverImage?: string; hoverImage?: string; spec?: string; image?: string; collection?: string; code?: string };
  onClick: () => void;
}

export default function FinishCard({ finish, onClick }: FinishCardProps) {
  const [hovered, setHovered] = useState(false);
  const showHover = hovered && !!finish.hoverImage;

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden text-left w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      aria-label={`Ver ${finish.name}`}
    >
      <div className="aspect-square overflow-hidden bg-foreground/5 relative">
        {/* Base image */}
        <img
          src={finish.image}
          alt={finish.name}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            showHover ? "opacity-0" : "opacity-100"
          }`}
        />
        {/* Hover image (room view) */}
        {finish.hoverImage && (
          <img
            src={finish.hoverImage}
            alt={`${finish.name} — vista de ambiente`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              showHover ? "opacity-100" : "opacity-0"
            }`}
          />
        )}
      </div>
      <div className="pt-3 pb-1 px-0">
        {finish.collection && (
          <p className="text-xs text-primary tracking-widest uppercase font-bold mb-0.5 truncate">
            {finish.collection}
          </p>
        )}
        <p className="text-sm font-semibold tracking-tight truncate">{finish.name}</p>
        <p className="text-xs text-foreground/40 font-mono mt-0.5">{finish.code}</p>
      </div>
    </button>
  );
}
