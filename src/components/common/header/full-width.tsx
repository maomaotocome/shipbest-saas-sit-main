"use client";

import { useEffect, useState } from "react";
import { Actions } from "./components/Actions";
import { Logo } from "./components/Logo";
import { Navigation } from "./components/Navigation";

interface HeaderProps {
  topOffset?: number;
}

const Header = ({ topOffset = 0 }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      style={{ top: topOffset }}
      className={`fixed right-0 select-none left-0 z-45 overflow-visible transition-all duration-300 ${
        scrolled
          ? "from-background/95 bg-linear-to-b to-transparent backdrop-blur-xs"
          : "from-background/0 bg-linear-to-b to-transparent backdrop-blur-xs"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Navigation />
          <Logo />
          <Actions />
        </div>
      </div>
    </header>
  );
};

export default Header;
