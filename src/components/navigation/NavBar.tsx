// src/components/navigation/NavBar.tsx
"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown } from "lucide-react";
import * as motion from "motion/react-client";
import { AnimatePresence } from "motion/react";
import type { INavItem } from "@/domain/types";

interface NavBarProps {
  items: INavItem[];
  transparent?: boolean;
}

export default function NavBar({ items, transparent = false }: NavBarProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<number | null>(null);

  const activeItem = items.find((i) => i.id === activeId);
  const hasChildren = (item: INavItem) => (item.children?.length ?? 0) > 0;
  const itemHref = (item: INavItem) => item.slug ? `/${item.slug}` : item.href || "#";
  const linkCls = transparent
    ? "text-white/90 hover:text-white"
    : "text-foreground/70 hover:text-foreground";

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const openMenu = (id: number) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActiveId(id);
  };
  const scheduleClose = () => {
    closeTimerRef.current = setTimeout(() => setActiveId(null), 80);
  };
  const cancelClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  };

  return (
    <>
      {/* Desktop nav items */}
      <div className="hidden md:flex items-center gap-0">
        {items.filter(i => i.visible).map((item) =>
          hasChildren(item) ? (
            <div
              key={item.id}
              className="relative"
              onMouseEnter={() => openMenu(item.id)}
              onMouseLeave={scheduleClose}
            >
              <button
                type="button"
                aria-haspopup="true"
                aria-expanded={activeId === item.id}
                onClick={() => setActiveId((prev) => (prev === item.id ? null : item.id))}
                onKeyDown={(e) => { if (e.key === "Escape") setActiveId(null); }}
                className={`flex items-center gap-1 px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors ${linkCls}`}
              >
                {item.label}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    activeId === item.id ? "rotate-180" : ""
                  } ${linkCls}`}
                />
              </button>
            </div>
          ) : (
            <Link
              key={item.id}
              href={itemHref(item)}
              className={`px-4 py-2 text-xs font-semibold tracking-widest uppercase transition-colors ${linkCls}`}
            >
              {item.label}
            </Link>
          )
        )}
      </div>

      {/* Desktop mega-menu panel */}
      <AnimatePresence>
        {activeId !== null && activeItem && hasChildren(activeItem) && (
          <motion.div
            key="mega-menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="fixed top-[92px] left-0 right-0 z-30 bg-background border-b border-foreground/10 shadow-lg"
          >
            <div className="px-12 md:px-20 py-8 flex gap-12 md:gap-20 flex-wrap">
              {activeItem.children!.filter(i => i.visible).map((child) => (
                <div key={child.id} className="min-w-[140px]">
                  <Link
                    href={itemHref(child)}
                    className="block text-sm font-bold tracking-wide text-foreground hover:text-primary transition-colors mb-3"
                    onClick={() => setActiveId(null)}
                  >
                    {child.label}
                  </Link>
                  {(child.children?.length ?? 0) > 0 && (
                    <ul className="flex flex-col gap-1.5">
                      {child.children!.filter(i => i.visible).map((grandchild) => (
                        <li key={grandchild.id}>
                          <Link
                            href={itemHref(grandchild)}
                            className="text-xs text-foreground/50 hover:text-foreground transition-colors"
                            onClick={() => setActiveId(null)}
                          >
                            {grandchild.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile hamburger toggle */}
      <button
        type="button"
        className={`md:hidden p-2 transition-colors ${linkCls}`}
        aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        onClick={() => { setMobileOpen((v) => !v); if (mobileOpen) setMobileExpanded(null); }}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile full-screen drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="fixed inset-0 z-50 bg-background flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-foreground/10">
              <span className="text-xs font-bold tracking-widest uppercase text-foreground/40">
                MENU
              </span>
              <button
                type="button"
                onClick={() => { setMobileOpen(false); setMobileExpanded(null); }}
                className="p-2 text-foreground/60 hover:text-foreground transition-colors"
                aria-label="Cerrar menu"
              >
                <X size={22} />
              </button>
            </div>
            <nav className="flex-1 px-6 py-6 flex flex-col divide-y divide-foreground/10">
              {items.filter(i => i.visible).map((item) => (
                <div key={item.id}>
                  {hasChildren(item) ? (
                    <>
                      <button
                        type="button"
                        aria-expanded={mobileExpanded === item.id}
                        onClick={() =>
                          setMobileExpanded((prev) =>
                            prev === item.id ? null : item.id
                          )
                        }
                        className="w-full flex items-center justify-between py-4 text-base font-bold tracking-wide text-foreground"
                      >
                        {item.label}
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            mobileExpanded === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pb-4 pl-2 flex flex-col">
                              {item.children!.filter(i => i.visible).map((child) => (
                                <div key={child.id}>
                                  <Link
                                    href={itemHref(child)}
                                    onClick={() => setMobileOpen(false)}
                                    className="block py-2.5 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors"
                                  >
                                    {child.label}
                                  </Link>
                                  {(child.children?.length ?? 0) > 0 && (
                                    <div className="pl-3 flex flex-col">
                                      {child.children!.filter(i => i.visible).map((grandchild) => (
                                        <Link
                                          key={grandchild.id}
                                          href={itemHref(grandchild)}
                                          onClick={() => setMobileOpen(false)}
                                          className="block py-1.5 text-xs text-foreground/50 hover:text-foreground transition-colors"
                                        >
                                          {grandchild.label}
                                        </Link>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={itemHref(item)}
                      onClick={() => setMobileOpen(false)}
                      className="block py-4 text-base font-bold tracking-wide text-foreground hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
