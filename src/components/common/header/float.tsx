"use client";

import { Actions } from "./components/Actions";
import { Logo } from "./components/Logo";
import { Navigation } from "./components/Navigation";

interface HeaderProps {
  topOffset?: number;
}

const Header = ({ topOffset = 0 }: HeaderProps) => {
  return (
    <header
      style={{ top: topOffset }}
      className={`from-background/95 select-none fixed right-0 left-0 z-45 overflow-visible transition-all duration-300`}
    >
      <div className="bg-background/80 container mx-auto mt-2 rounded-full px-8 shadow-lg shadow-black/10 backdrop-blur-xs dark:shadow-white/10">
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
