import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import * as motion from "motion/react-client";
import NavBar from "./NavBar";
import type { INavItem } from "@/domain/types";

interface TopBarProps {
  navItems?: INavItem[];
}

const TopBar = ({ navItems = [] }: TopBarProps) => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 right-0 left-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-500 ${
        scrolled ? "bg-background/90 backdrop-blur-md shadow-sm" : ""
      }`}
    >
      <Link href="/" className="flex items-center gap-3 flex-shrink-0">
        <Image
          src="/logos/CR.png"
          alt="Comercializadora Rivera"
          width={60}
          height={60}
          className="w-15 h-15 object-cover"
        />
      </Link>
      <NavBar items={navItems} transparent={!scrolled} />
    </motion.header>
  );
};

export default TopBar;